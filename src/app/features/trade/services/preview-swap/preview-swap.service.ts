import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, forkJoin, from, interval, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  switchMap,
  takeWhile,
  tap
} from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AssetSelector } from '@shared/models/asset-selector';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import BigNumber from 'bignumber.js';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CrossChainTradeType,
  EvmBlockchainName,
  TX_STATUS,
  Web3PublicSupportedBlockchain
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { TransactionState } from '@features/trade/models/transaction-state';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TradePageService } from '@features/trade/services/trade-page/trade-page.service';
import { AirdropPointsService } from '@shared/services/airdrop-points-service/airdrop-points.service';
import { UnreadTradesService } from '@core/services/unread-trades-service/unread-trades.service';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { SelectedTrade } from '@features/trade/models/selected-trade';
import { ErrorsService } from '@core/errors/errors.service';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';

interface TokenFiatAmount {
  tokenAmount: BigNumber;
  fiatAmount: string;
}

interface TradeInfo {
  fromAsset: AssetSelector;
  fromValue: TokenFiatAmount;
  toAsset: AssetSelector;
  toValue: TokenFiatAmount;
}

@Injectable()
export class PreviewSwapService {
  private readonly _transactionState$ = new BehaviorSubject<TransactionState>({
    step: 'inactive',
    data: {}
  });

  public get transactionState(): TransactionState {
    return this._transactionState$.getValue();
  }

  public readonly transactionState$ = this._transactionState$.asObservable();

  // public readonly tradeState$ = this.transactionState$.pipe(
  //   first(el => el.step === 'idle'),
  //   switchMap(() => this.swapsStateService.tradeState$)
  // );

  private readonly _selectedTradeState$ = new BehaviorSubject<SelectedTrade | null>(null);

  public readonly selectedTradeState$ = this._selectedTradeState$.asObservable();

  // public readonly tradeState$: Observable<SelectedTrade> = this.swapsStateService.tradeState$.pipe(
  //   debounceTime(50),
  //   first()
  // );

  public tradeInfo$: Observable<TradeInfo> = forkJoin([
    this.swapForm.fromToken$.pipe(first()),
    this.swapForm.fromAmount$.pipe(first()),
    this.swapForm.toToken$.pipe(first()),
    this.swapForm.toAmount$.pipe(first())
  ]).pipe(
    map(([fromToken, fromAmount, toToken, toAmount]) => {
      const fromAsset = this.getTokenAsset(fromToken);
      const fromValue = {
        tokenAmount: fromAmount.actualValue,
        fiatAmount:
          fromAmount.actualValue.gt(0) && fromToken.price
            ? fromAmount.actualValue.multipliedBy(fromToken.price || 0).toFixed(2)
            : null
      };

      const toAsset = this.getTokenAsset(toToken);
      const toValue = {
        tokenAmount: toAmount,
        fiatAmount:
          toAmount.gt(0) && toToken.price
            ? toAmount.multipliedBy(toToken.price || 0).toFixed(2)
            : null
      };

      return { fromAsset, fromValue, toAsset, toValue };
    })
  );

  constructor(
    private readonly swapsStateService: SwapsStateService,
    private readonly swapForm: SwapsFormService,
    private readonly swapsControllerService: SwapsControllerService,
    private readonly sdkService: SdkService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly tradePageService: TradePageService,
    private readonly airdropPointsService: AirdropPointsService,
    private readonly recentTradesStoreService: UnreadTradesService,
    private readonly settingsService: SettingsService,
    private readonly errorsService: ErrorsService
  ) {
    this.handleTransactionState();
    this.subscribeOnNetworkChange();
    this.subscribeOnAddressChange();
    this.subscribeOnFormChange();
  }

  private getTokenAsset(token: TokenAmount): AssetSelector {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }

  public setNextTxState(state: TransactionState): void {
    this._transactionState$.next(state);
  }

  public async requestTxSign(): Promise<void> {
    const tradeState = await firstValueFrom(this.selectedTradeState$);

    if (tradeState.needApprove) {
      this.startApprove();
    } else {
      this.startSwap();
    }
  }

  public startSwap(): void {
    this._transactionState$.next({ step: 'swapRequest', data: this.transactionState.data });
  }

  public startApprove(): void {
    this._transactionState$.next({ step: 'approvePending', data: this.transactionState.data });
  }

  public activatePage(): void {
    this._transactionState$.next({ step: 'idle', data: {} });
  }

  private handleTransactionState(): void {
    this.transactionState$
      .pipe(
        distinctUntilChanged(),
        filter(state => state.step !== 'inactive'),
        debounceTime(10),
        switchMap(state => {
          return forkJoin([this.selectedTradeState$.pipe(first()), of(state)]);
        }),
        switchMap(([tradeState, txState]) => {
          return forkJoin([
            of(tradeState),
            of(txState),
            this.airdropPointsService.getSwapAndEarnPointsAmount(tradeState.trade).pipe(first())
          ]);
        }),
        switchMap(([tradeState, txState, points]) => {
          switch (txState.step) {
            case 'approvePending': {
              return this.swapsControllerService.approve(tradeState, {
                onSwap: () => {
                  this._transactionState$.next({
                    step: 'swapRequest',
                    data: this.transactionState.data
                  });
                },
                onError: () => {
                  this._transactionState$.next({
                    step: 'approveReady',
                    data: this.transactionState.data
                  });
                }
              });
            }
            case 'swapRequest': {
              let txHash: string;
              const useMevProtection =
                this.settingsService.crossChainRoutingValue.useMevBotProtection;
              return from(this.loadRpcParams(useMevProtection)).pipe(
                switchMap(rpcChanged => {
                  return rpcChanged
                    ? this.swapsControllerService.swap(tradeState, {
                        onHash: (hash: string) => {
                          txHash = hash;
                          this._transactionState$.next({
                            step: 'sourcePending',
                            data: { ...this.transactionState.data, points }
                          });
                        },
                        onSwap: (additionalInfo: { changenowId?: string }) => {
                          if (tradeState.trade instanceof CrossChainTrade) {
                            this._transactionState$.next({
                              step: 'destinationPending',
                              data: { ...this.transactionState.data, points }
                            });
                            this.initDstTxStatusPolling(
                              txHash,
                              Date.now(),
                              tradeState.trade.to.blockchain,
                              additionalInfo,
                              points
                            );
                          } else {
                            this._transactionState$.next({
                              step: 'success',
                              data: {
                                hash: txHash,
                                toBlockchain: tradeState.trade.to.blockchain,
                                points
                              }
                            });
                          }

                          this.airdropPointsService.updateSwapToEarnUserPointsInfo();
                          this.recentTradesStoreService.updateUnreadTrades();
                        },
                        onError: () => {
                          this._transactionState$.next({ step: 'inactive', data: {} });
                          this.tradePageService.setState('form');
                        }
                      })
                    : this.catchSwitchCancel();
                })
              );
            }
            default: {
              return of(null);
            }
          }
        })
      )
      .subscribe();
  }

  public initDstTxStatusPolling(
    srcHash: string,
    timestamp: number,
    toBlockchain: BlockchainName,
    additionalInfo: { changenowId?: string },
    points: number
  ): void {
    interval(30_000)
      .pipe(
        startWith(-1),
        switchMap(() => this.selectedTradeState$.pipe(first())),
        switchMap(tradeState => {
          return from(
            this.sdkService.crossChainStatusManager.getCrossChainStatus(
              {
                fromBlockchain: tradeState.trade.from.blockchain as Web3PublicSupportedBlockchain,
                toBlockchain: tradeState.trade.to.blockchain,
                srcTxHash: srcHash,
                txTimestamp: timestamp,
                ...(additionalInfo?.changenowId && {
                  changenowId: additionalInfo.changenowId
                }),
                ...('amountOutMin' in tradeState.trade && {
                  amountOutMin: tradeState.trade.amountOutMin as string
                })
              },
              tradeState.tradeType as CrossChainTradeType
            )
          );
        }),
        tap(crossChainStatus => {
          if (crossChainStatus.dstTxStatus === TX_STATUS.SUCCESS) {
            this._transactionState$.next({
              step: 'success',
              data: {
                hash: crossChainStatus.dstTxHash,
                toBlockchain,
                points
              }
            });
          } else if (crossChainStatus.dstTxStatus === TX_STATUS.FAIL) {
            this._transactionState$.next({ step: 'error', data: this.transactionState.data });
          }
        }),
        takeWhile(crossChainStatus => crossChainStatus.dstTxStatus === TX_STATUS.PENDING)
      )
      .subscribe();
  }

  private subscribeOnFormChange(): void {
    this.tradePageService.formContent$
      .pipe(filter(content => content === 'preview'))
      .subscribe(() => {
        this.checkAddress();
        this.checkNetwork();
      });
  }

  private subscribeOnNetworkChange(): void {
    this.walletConnectorService.networkChange$.subscribe(() => this.checkNetwork());
  }

  private subscribeOnAddressChange(): void {
    this.walletConnectorService.addressChange$.subscribe(() => this.checkAddress());
  }

  private checkAddress(): void {
    const address = this.walletConnectorService.address;
    const state = this._transactionState$.getValue();
    state.data.activeWallet = Boolean(address);
    this._transactionState$.next(state);
  }

  private async checkNetwork(): Promise<void> {
    const network = this.walletConnectorService.network;
    const selectedTrade = this._selectedTradeState$.value;
    const tokenBlockchain = selectedTrade?.trade?.from?.blockchain;
    const state = this._transactionState$.getValue();
    state.data.wrongNetwork = tokenBlockchain && network !== tokenBlockchain;
    this._transactionState$.next(state);
  }

  private async loadRpcParams(useCustomRpc: boolean): Promise<boolean> {
    const tradeState = await firstValueFrom(this.selectedTradeState$);
    const fromBlockchain = tradeState.trade.from.blockchain as EvmBlockchainName;
    let rpc = undefined;
    if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM && useCustomRpc) {
      rpc = 'https://rpc.propellerheads.xyz/eth';
    }

    try {
      await this.walletConnectorService.addChain(fromBlockchain, rpc);
      return true;
    } catch {
      return false;
    }
  }

  public getSelectedProvider(): void {
    this._selectedTradeState$.next(this.swapsStateService.tradeState);
  }

  private async catchSwitchCancel(): Promise<void> {
    this.errorsService.catch(new UserRejectError());
    this._transactionState$.next({ step: 'inactive', data: {} });
    this.tradePageService.setState('form');
  }
}
