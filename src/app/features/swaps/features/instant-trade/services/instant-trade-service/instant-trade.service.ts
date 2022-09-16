import { Injectable } from '@angular/core';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { firstValueFrom, Subscription, switchMap, timer } from 'rxjs';
import BigNumber from 'bignumber.js';
import { InstantTradesApiService } from '@core/services/backend/instant-trades-api/instant-trades-api.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TransactionReceipt } from 'web3-eth';
import { EthWethSwapProviderService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-weth-swap/eth-weth-swap-provider.service';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import {
  InstantTrade,
  TradeType,
  BlockchainName,
  InstantTradeError,
  EncodeTransactionOptions,
  Web3Pure,
  Web3Public,
  UnnecessaryApproveError,
  BLOCKCHAIN_NAME,
  TransactionOptions,
  SwapTransactionOptions
} from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import WrapTrade from '@features/swaps/features/instant-trade/models/wrap-trade';
import {
  IT_PROXY_FEE_CONTRACT_ABI,
  IT_PROXY_FEE_CONTRACT_ADDRESS,
  IT_PROXY_FEE_CONTRACT_METHOD
} from '@features/swaps/features/instant-trade/services/instant-trade-service/constants/iframe-proxy-fee-contract';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-options';
import { shouldCalculateGas } from '@features/swaps/features/instant-trade/services/instant-trade-service/constants/should-calculate-gas';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from '@core/services/auth/auth.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { TradeParser } from '@features/swaps/features/instant-trade/services/instant-trade-service/utils/trade-parser';
import { ENVIRONMENT } from 'src/environments/environment';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/components/target-network-address/services/target-network-address.service';

@Injectable()
export class InstantTradeService extends TradeService {
  private static readonly unsupportedItNetworks: BlockchainName[] = [];

  public static isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return !InstantTradeService.unsupportedItNetworks.includes(blockchain);
  }

  constructor(
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly ethWethSwapProvider: EthWethSwapProviderService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly sdk: RubicSdkService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly gasService: GasService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService
  ) {
    super('instant-trade');
  }

  public async needApprove(trade: InstantTrade): Promise<boolean> {
    if (this.iframeService.isIframeWithFee(trade.from.blockchain, trade.type)) {
      if (Web3Pure.isNativeAddress(trade.from.address)) {
        return false;
      }

      const allowance = await Injector.web3PublicService
        .getWeb3Public(trade.from.blockchain)
        .getAllowance(
          trade.from.address,
          this.authService.userAddress,
          IT_PROXY_FEE_CONTRACT_ADDRESS
        );
      return new BigNumber(allowance).lt(trade.from.weiAmount);
    }
    return trade.needApprove();
  }

  public async approve(trade: InstantTrade): Promise<void> {
    this.checkDeviceAndShowNotification();
    let subscription$: Subscription;
    const { blockchain } = TradeParser.getItSwapParams(trade);
    const useRubicGasPrice = shouldCalculateGas[blockchain];

    const transactionOptions = {
      onTransactionHash: () => {
        subscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(useRubicGasPrice && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      })
    };

    try {
      if (this.iframeService.isIframeWithFee(trade.from.blockchain, trade.type)) {
        await Injector.web3Private.approveTokens(
          trade.from.address,
          IT_PROXY_FEE_CONTRACT_ADDRESS,
          'infinity',
          transactionOptions
        );
      } else {
        await trade.approve(transactionOptions);
      }

      this.notificationsService.showApproveSuccessful();
    } catch (err) {
      if (err instanceof UnnecessaryApproveError) {
        return;
      }
      throw err;
    } finally {
      subscription$?.unsubscribe();
    }
  }

  public getEthWethTrade(): WrapTrade | null {
    const { fromAmount, fromToken, toToken, fromBlockchain } = this.swapFormService.inputValue;

    if (
      !fromToken ||
      !toToken ||
      !this.ethWethSwapProvider.isEthAndWethSwap(fromBlockchain, fromToken.address, toToken.address)
    ) {
      return null;
    }

    return {
      blockchain: fromBlockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: fromAmount
      }
    };
  }

  public async calculateTrades(
    fromToken: {
      address: string;
      blockchain: BlockchainName;
    },
    fromAmount: string,
    toToken: {
      address: string;
      blockchain: BlockchainName;
    }
  ): Promise<Array<InstantTrade | InstantTradeError>> {
    return this.sdk.instantTrade.calculateTrade(fromToken, fromAmount, toToken.address, {
      timeout: 10000,
      slippageTolerance: this.settingsService.instantTradeValue.slippageTolerance / 100,
      gasCalculation: shouldCalculateGas[fromToken.blockchain] ? 'calculate' : 'disabled',
      zrxAffiliateAddress: ENVIRONMENT.zrxAffiliateAddress
    });
  }

  public async createTrade(
    providerName: TradeType,
    trade: InstantTrade | WrapTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    this.checkDeviceAndShowNotification();
    const { fromSymbol, toSymbol, fromAmount, fromPrice, blockchain, fromAddress, fromDecimals } =
      TradeParser.getItSwapParams(trade);

    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    await blockchainAdapter.checkBalance(
      { address: fromAddress, decimals: fromDecimals, symbol: fromSymbol },
      fromAmount,
      this.authService.userAddress
    );

    let transactionHash: string;
    let subscription$: Subscription;

    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];

    const receiverAddress =
      this.targetNetworkAddressService.targetAddress?.isValid &&
      this.targetNetworkAddressService.targetAddress?.value;
    const options: SwapTransactionOptions = {
      onConfirm: (hash: string) => {
        transactionHash = hash;
        confirmCallback?.();

        this.notifyGtmAfterSignTx(
          transactionHash,
          fromSymbol,
          toSymbol,
          fromAmount.multipliedBy(fromPrice)
        );
        this.gtmService.checkGtm();

        subscription$ = this.notifyTradeInProgress(hash, blockchain);

        this.postTrade(hash, providerName, trade);
      },
      ...(shouldCalculateGasPrice && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      }),
      ...(receiverAddress && { receiverAddress })
    };

    try {
      let receipt;
      if (trade instanceof InstantTrade) {
        receipt = await this.checkFeeAndCreateTrade(providerName, trade, options);
      } else {
        receipt = await this.ethWethSwapProvider.createTrade(trade, options);
      }

      subscription$.unsubscribe();
      this.showSuccessTrxNotification();
      this.updateTrade(transactionHash, true);

      await this.instantTradesApiService
        .notifyInstantTradesBot({
          provider: providerName,
          blockchain,
          walletAddress: receipt.from,
          trade,
          txHash: transactionHash
        })
        .catch(_err => {});
    } catch (err) {
      subscription$?.unsubscribe();

      if (transactionHash && !this.isNotMinedError(err)) {
        this.updateTrade(transactionHash, false);
      }

      throw err;
    }
  }

  private async checkFeeAndCreateTrade(
    providerName: TradeType,
    trade: InstantTrade,
    options: SwapTransactionOptions
  ): Promise<Partial<TransactionReceipt>> {
    await this.walletConnectorService.checkSettings(trade.from.blockchain);
    if (this.iframeService.isIframeWithFee(trade.from.blockchain, providerName)) {
      return this.createTradeWithFee(trade, options);
    }

    return trade.swap(options);
  }

  private async createTradeWithFee(
    trade: InstantTrade,
    options: ItOptions
  ): Promise<Partial<TransactionReceipt>> {
    const fullOptions: EncodeTransactionOptions = {
      ...options,
      fromAddress: IT_PROXY_FEE_CONTRACT_ADDRESS,
      supportFee: false
    };
    const transactionOptions = await trade.encode(fullOptions);
    const { feeData } = this.iframeService;
    const fee = feeData.fee * 1000;

    const promoterAddress = await firstValueFrom(this.iframeService.getPromoterAddress());

    const methodName = promoterAddress
      ? IT_PROXY_FEE_CONTRACT_METHOD.SWAP_WITH_PROMOTER
      : IT_PROXY_FEE_CONTRACT_METHOD.SWAP;

    const methodArguments = [
      trade.from.address,
      trade.to.address,
      Web3Pure.toWei(trade.from.tokenAmount, trade.from.decimals),
      transactionOptions.to,
      transactionOptions.data,
      [fee, feeData.feeTarget]
    ];
    if (promoterAddress) {
      methodArguments.push(promoterAddress);
    }
    return Injector.web3Private.tryExecuteContractMethod(
      IT_PROXY_FEE_CONTRACT_ADDRESS,
      IT_PROXY_FEE_CONTRACT_ABI,
      methodName,
      methodArguments,
      {
        ...transactionOptions,
        gas: undefined
      } as TransactionOptions
    );
  }

  private async postTrade(
    transactionHash: string,
    providerName: TradeType,
    trade: InstantTrade | WrapTrade
  ): Promise<void> {
    let fee: number;
    let promoCode: string;
    const { blockchain } = TradeParser.getItSwapParams(trade);
    if (this.iframeService.isIframeWithFee(blockchain, providerName)) {
      fee = this.iframeService.feeData.fee;
      promoCode = this.iframeService.promoCode;
    }

    // Boba is too fast, status does not have time to get into the database.
    const waitTime = blockchain === BLOCKCHAIN_NAME.BOBA ? 3_000 : 0;
    await timer(waitTime)
      .pipe(
        switchMap(() =>
          this.instantTradesApiService.createTrade(
            transactionHash,
            providerName,
            trade,
            fee,
            promoCode
          )
        )
      )
      .toPromise();
  }

  /**
   * Checks if error is that transaction was not yet mined.
   * @param err Error thrown during creating transaction.
   */
  private isNotMinedError(err: Error): boolean {
    return (
      Boolean(err?.message?.includes) &&
      err.message.includes(
        'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
      )
    );
  }

  /**
   * Calls api service method to update transaction's status.
   * @param hash Transaction's hash.
   * @param success If true status is `completed`, otherwise `cancelled`.
   */
  private updateTrade(hash: string, success: boolean): Subscription {
    return this.instantTradesApiService.patchTrade(hash, success).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  private notifyGtmAfterSignTx(
    transactionHash: string,
    fromToken: string,
    toToken: string,
    price: BigNumber
  ): void {
    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      transactionHash,
      fromToken,
      toToken,
      new BigNumber(0),
      price
    );
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }
}
