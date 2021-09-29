import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { ZrxApiResponse } from 'src/app/features/instant-trade/services/instant-trade-service/models/zrx/zrx-types';
import { HttpService } from 'src/app/core/services/http/http.service';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { ZrxCalculateTradeParams } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/zrx/models/ZrxCalculateTradeParams';
import { ZRX_API_ADDRESS } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/ZRX_API_ADDRESS';
import { ZRX_NATIVE_TOKEN } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/ZRX_NATIVE_TOKEN';
import {
  SupportedZrxBlockchain,
  supportedZrxBlockchains
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/SupportedZrxBlockchain';
import { filter, first, mergeMap, startWith } from 'rxjs/operators';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ZrxService implements ItProvider {
  private web3Public: Web3Public;

  private settings: ItSettingsForm;

  private currentTradeData: ZrxApiResponse;

  private tradeDataIsUpdated: BehaviorSubject<boolean>;

  protected blockchain: SupportedZrxBlockchain;

  private apiAddress: string;

  private walletAddress: string;

  private isTestingMode: boolean;

  public static isSupportedBlockchain(
    blockchain: BLOCKCHAIN_NAME
  ): blockchain is SupportedZrxBlockchain {
    return supportedZrxBlockchains.some(supportedBlockchain => supportedBlockchain === blockchain);
  }

  constructor(
    private readonly settingsService: SettingsService,
    private readonly web3PublicService: Web3PublicService,
    private readonly web3PrivateService: Web3PrivateService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly swapFormService: SwapFormService,
    private readonly httpService: HttpService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService
  ) {
    this.tradeDataIsUpdated = new BehaviorSubject(false);

    this.swapFormService.input.controls.fromBlockchain.valueChanges.subscribe(() =>
      this.setZrxParams()
    );

    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(formValue => {
        this.settings = {
          ...formValue,
          slippageTolerance: formValue.slippageTolerance / 100
        };
      });

    this.authService.getCurrentUser().subscribe(user => {
      this.walletAddress = user?.address;
    });

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
      this.setZrxParams();
    });
  }

  private setZrxParams() {
    const { fromBlockchain } = this.swapFormService.inputValue;
    this.web3Public = this.web3PublicService[fromBlockchain];

    let blockchain: BLOCKCHAIN_NAME;
    if (this.isTestingMode) {
      blockchain = `${fromBlockchain}_TESTNET` as BLOCKCHAIN_NAME;
    } else {
      blockchain = fromBlockchain;
    }
    if (ZrxService.isSupportedBlockchain(blockchain)) {
      this.blockchain = blockchain;
      this.apiAddress = ZRX_API_ADDRESS[blockchain];
    }
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    if (Web3Public.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return this.tradeDataIsUpdated.pipe(
      filter(value => !!value),
      first(),
      mergeMap(() => {
        this.tradeDataIsUpdated.next(false);
        return this.web3Public.getAllowance(
          tokenAddress,
          this.walletAddress,
          this.currentTradeData?.allowanceTarget
        );
      })
    );
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    this.providerConnectorService.checkSettings(this.blockchain);
    await this.web3PrivateService.approveTokens(
      tokenAddress,
      this.currentTradeData.allowanceTarget,
      'infinity',
      options
    );
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade> {
    const fromTokenClone = { ...fromToken };
    const toTokenClone = { ...toToken };

    if (Web3Public.isNativeAddress(fromToken.address)) {
      fromTokenClone.address = ZRX_NATIVE_TOKEN;
    }
    if (Web3Public.isNativeAddress(toToken.address)) {
      toTokenClone.address = ZRX_NATIVE_TOKEN;
    }

    const params: ZrxCalculateTradeParams = {
      sellToken: fromTokenClone.address,
      buyToken: toTokenClone.address,
      sellAmount: Web3Public.toWei(fromAmount, fromToken.decimals),
      slippagePercentage: this.settings.slippageTolerance.toString()
    };
    this.currentTradeData = await this.fetchTrade(params);
    this.tradeDataIsUpdated.next(true);

    const trade: InstantTrade = {
      blockchain: BLOCKCHAIN_NAME.ETHEREUM,
      from: {
        token: fromToken,
        amount: new BigNumber(this.currentTradeData.sellAmount)
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(this.currentTradeData.buyAmount, toToken.decimals)
      }
    };
    if (!shouldCalculateGas) {
      return trade;
    }

    const { estimatedGas } = this.currentTradeData;
    const gasPriceInEth = Web3Public.fromWei(this.currentTradeData.gasPrice);
    const nativeCoinPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
    const gasPriceInUsd = gasPriceInEth.multipliedBy(nativeCoinPrice);
    const gasFeeInEth = gasPriceInEth.multipliedBy(estimatedGas);
    const gasFeeInUsd = gasPriceInUsd.multipliedBy(estimatedGas);

    return {
      ...trade,
      gasLimit: estimatedGas,
      gasPrice: this.currentTradeData.gasPrice,
      gasFeeInEth,
      gasFeeInUsd
    };
  }

  public async createTrade(
    trade: InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    this.providerConnectorService.checkSettings(trade.blockchain);

    const amount = Web3Public.fromWei(trade.from.amount, trade.from.token.decimals);
    await this.web3Public.checkBalance(trade.from.token, amount, this.walletAddress);

    return this.web3PrivateService.trySendTransaction(this.currentTradeData.to, amount, {
      data: this.currentTradeData.data,
      gas: this.currentTradeData.gas,
      gasPrice: this.currentTradeData.gasPrice,
      value: this.currentTradeData.value,
      onTransactionHash: options.onConfirm
    });
  }

  private fetchTrade(params: ZrxCalculateTradeParams): Promise<ZrxApiResponse> {
    return this.httpService
      .get<ZrxApiResponse>('swap/v1/quote', params, this.apiAddress)
      .toPromise();
  }
}
