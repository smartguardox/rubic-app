import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { SwapInfoService } from '@features/swaps/features/main-form/components/swap-info/services/swap-info.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { forkJoin, from, of } from 'rxjs';
import { PERMITTED_PRICE_DIFFERENCE } from '@shared/constants/common/permited-price-difference';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

import { SettingsService } from '@app/features/swaps/features/main-form/services/settings-service/settings.service';
import {
  Web3Pure,
  BlockchainsInfo as SdkBlockchainsInfo,
  TronBridgersCrossChainTrade,
  EvmBridgersCrossChainTrade,
  CelerCrossChainTrade,
  FeeInfo
} from 'rubic-sdk';
import { SwapButtonService } from '@features/swaps/shared/swap-button-container/services/swap-button.service';

@Component({
  selector: 'app-cross-chain-swap-info',
  templateUrl: './cross-chain-swap-info.component.html',
  styleUrls: ['./cross-chain-swap-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class CrossChainSwapInfoComponent implements OnInit {
  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public nativeCoinSymbol: string;

  public estimateGasInEth: BigNumber;

  public estimateGasInUsd: BigNumber;

  public cryptoFeeInEth: number;

  public cryptoFeeInUsd: BigNumber;

  public feePercent: number;

  public feeAmount: BigNumber;

  public feeTokenSymbol: string;

  public minimumReceived: BigNumber;

  public priceImpact: number;

  public priceImpactFrom: number;

  public priceImpactTo: number;

  public slippage: number;

  public twoWaySwap: boolean;

  public symbiosisOrLifiCryptoFee: BigNumber;

  public symbiosisOrLifiCryptoFeeSymbol: string;

  public isBridgers: boolean;

  public feeInfo: FeeInfo;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly swapInfoService: SwapInfoService,
    private readonly swapFormService: SwapFormService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    private readonly settingsService: SettingsService,
    private readonly tokensService: TokensService,
    private readonly priceImpactService: PriceImpactService,
    private readonly swapButtonService: SwapButtonService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.subscribeOnInputValue();
    this.subscribeOnOutputValue();
  }

  private subscribeOnInputValue(): void {
    this.swapFormService.inputValueChanges
      .pipe(startWith(this.swapFormService.inputValue), takeUntil(this.destroy$))
      .subscribe(form => {
        this.fromToken = form.fromToken;
        this.toToken = form.toToken;

        this.cdr.markForCheck();
      });
  }

  /**
   * Subscribes on output form value, and after change gets info from cross chain service to update trade info.
   */
  private subscribeOnOutputValue(): void {
    this.swapFormService.outputValueChanges
      .pipe(
        switchMap(form => {
          const { toAmount } = form;
          if (!toAmount?.isFinite()) {
            this.swapInfoService.emitInfoCalculated();
            return of(null);
          }

          const { fromBlockchain } = this.swapFormService.inputValue;
          return forkJoin([
            this.tokensService.tokens$.pipe(first(tokens => !!tokens.size)),
            from(this.tokensService.getNativeCoinPriceInUsd(fromBlockchain))
          ]).pipe(
            map(([tokens, nativeCoinPrice]) => {
              const nativeToken = tokens.find(
                token =>
                  token.blockchain === fromBlockchain &&
                  Web3Pure[SdkBlockchainsInfo.getChainType(token.blockchain)].isNativeAddress(
                    token.address
                  )
              );

              this.nativeCoinSymbol = nativeToken.symbol;

              this.setTradeInfoParams(nativeCoinPrice);

              this.swapInfoService.emitInfoCalculated();
            })
          );
        }),
        watch(this.cdr),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  // private setSymbiosisOrLifiTradeInfoParameters(tradeInfo: SymbiosisTradeInfo): void {
  //   this.priceImpact = parseFloat(tradeInfo.priceImpact);
  //   this.priceImpactService.setPriceImpact(this.priceImpact);
  //
  //   this.symbiosisOrLifiCryptoFee = tradeInfo.networkFee;
  //   this.symbiosisOrLifiCryptoFeeSymbol = tradeInfo.networkFeeSymbol;
  //
  //   this.feePercent = tradeInfo.feePercent;
  //   this.feeAmount = tradeInfo.feeAmount;
  //   this.feeTokenSymbol = tradeInfo.feeTokenSymbol;
  // }

  // /**
  //  * Sets parameters of currently selected ccr trade.
  //  */
  // private setCelerRubicTradeInfoParameters(
  //   tradeInfo: CelerRubicTradeInfo,
  //   nativeCoinPrice: number
  // ): void {
  //   this.estimateGasInEth = tradeInfo.estimatedGas;
  //   this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);
  //
  //   this.cryptoFeeInEth = tradeInfo.cryptoFee;
  //   this.cryptoFeeInUsd = new BigNumber(this.cryptoFeeInEth).multipliedBy(nativeCoinPrice);
  //   this.feePercent = tradeInfo.feePercent;
  //   this.feeAmount = tradeInfo.feeAmount;
  //   this.feeTokenSymbol = tradeInfo.feeTokenSymbol;
  //
  //   this.minimumReceived = this.crossChainRoutingService.crossChainTrade.toTokenAmountMin;
  //   this.slippage = this.settingsService.crossChainRoutingValue.slippageTolerance;
  // }

  /**
   * Sets from and to price impacts and sets maximum as current price impact.
   */
  private setTwoWayPriceImpact(priceImpactFrom: number, priceImpactTo: number): void {
    this.priceImpactFrom = priceImpactFrom;
    if (this.priceImpactFrom < -PERMITTED_PRICE_DIFFERENCE * 100) {
      this.priceImpactFrom = null;
    }
    this.priceImpactTo = priceImpactTo;
    if (this.priceImpactTo < -PERMITTED_PRICE_DIFFERENCE * 100) {
      this.priceImpactTo = null;
    }

    const maxPriceImpact =
      this.priceImpactFrom !== null || this.priceImpactTo !== null
        ? Math.max(this.priceImpactFrom, this.priceImpactTo)
        : null;
    this.priceImpactService.setPriceImpact(maxPriceImpact);
    this.swapButtonService.setupPriceImpactCalculation();
  }

  private setTradeInfoParams(nativeCoinPrice: number): void {
    const trade = this.crossChainRoutingService.crossChainTrade;
    const tradeInfo = trade.getTradeInfo();
    this.twoWaySwap = !(trade instanceof CelerCrossChainTrade);
    this.estimateGasInEth = tradeInfo.estimatedGas;
    this.estimateGasInUsd = this.estimateGasInEth?.multipliedBy(nativeCoinPrice);
    this.minimumReceived = trade.toTokenAmountMin.multipliedBy(1 - this.slippage / 100);
    this.feeInfo = tradeInfo.feeInfo;
    this.cryptoFeeInUsd = new BigNumber(tradeInfo.feeInfo.cryptoFee?.amount || 0).multipliedBy(
      nativeCoinPrice
    );

    if ('total' in tradeInfo.slippage) {
      this.slippage = tradeInfo.slippage.total;
    } else if (tradeInfo.slippage) {
      this.slippage = tradeInfo.slippage?.from + tradeInfo.slippage?.to;
    } else {
      this.slippage = 0;
    }

    if ('total' in tradeInfo.priceImpact) {
      this.priceImpact = tradeInfo.priceImpact.total;
      this.priceImpactService.setPriceImpact(this.priceImpact);
    } else if (tradeInfo.priceImpact) {
      this.setTwoWayPriceImpact(tradeInfo.priceImpact.from, tradeInfo.priceImpact.to);
    } else {
      this.priceImpact = 0;
    }

    this.isBridgers =
      trade instanceof EvmBridgersCrossChainTrade || trade instanceof TronBridgersCrossChainTrade;
  }
}
