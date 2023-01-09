import { Inject, Injectable, Injector as AngularInjector, INJECTOR } from '@angular/core';
import { Blockchain, BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import {
  BLOCKCHAIN_NAME,
  ERC20_TOKEN_ABI,
  MethodDecoder,
  Web3Pure,
  Injector,
  EvmBlockchainName,
  RubicSdkError,
  UserRejectError
} from 'rubic-sdk';
import { FormControl, FormGroup } from '@angular/forms';
import { FormControlType } from '@shared/models/utils/angular-forms-types';
import { SupportedBlockchain, supportedBlockchains } from '../constants/supported-blockchains';
import {
  combineLatestWith,
  map,
  Observable,
  shareReplay,
  startWith,
  Subscription,
  switchMap
} from 'rxjs';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RevokeModalComponent } from '@features/approve-scanner/components/revoke-modal/revoke-modal.component';
import { Cacheable } from 'ts-cacheable';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import BigNumber from 'bignumber.js';
import { TokenApproveData } from '@features/approve-scanner/models/token-approve-data';
import { TokensService } from '@core/services/tokens/tokens.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

interface ApproveForm {
  blockchain: Blockchain;
  searchQuery: string;
}

interface ApproveTransaction {
  hash: string;
  tokenAddress: string;
  spender: string;
  value: string;
}

interface ScannerResult {
  hash: string;
  functionName: string;
  to: string;
  input: string;
}

interface ScannerResponse {
  result: ScannerResult[] | string;
}

type ApproveFormControl = FormControlType<ApproveForm>;

@Injectable()
export class ApproveScannerService {
  public readonly supportedBlockchains = Object.entries(BLOCKCHAINS)
    .filter(([blockchain]: [SupportedBlockchain, Blockchain]) =>
      supportedBlockchains.includes(blockchain)
    )
    .map(([_blockchain, meta]) => meta);

  private readonly defaultBlockchain = this.supportedBlockchains.find(
    blockchain =>
      blockchain.key === (this.walletConnectorService.network ?? BLOCKCHAIN_NAME.ETHEREUM)
  );

  public readonly form = new FormGroup<ApproveFormControl>({
    blockchain: new FormControl(this.defaultBlockchain),
    searchQuery: new FormControl(null)
  });

  public readonly selectedBlockchain$ = this.form.controls.blockchain.valueChanges.pipe(
    startWith(this.form.controls.blockchain.value),
    shareReplay(shareReplayConfig)
  );

  public readonly searchQuery$ = this.form.controls.searchQuery.valueChanges;

  public readonly allApproves$ = this.selectedBlockchain$.pipe(
    startWith(this.defaultBlockchain),
    switchMap(blockchain => this.fetchTransactions(blockchain))
  );

  public readonly visibleApproves$ = this.allApproves$.pipe(
    combineLatestWith(this.searchQuery$.pipe(startWith(null), debounceTime(100))),
    map(([approves, query]) => this.searchStringInTable(approves, query))
  );

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly httpService: HttpClient,
    @Inject(INJECTOR) private readonly injector: AngularInjector,
    private readonly dialogService: TuiDialogService,
    private readonly tokensService: TokensService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService
  ) {}

  @Cacheable({ maxAge: 120_000 })
  private fetchTransactions(blockchain: Blockchain): Observable<ApproveTransaction[]> {
    const userAddress = this.walletConnectorService.address;
    const blockchainAddressMapper: Record<SupportedBlockchain, string> = {
      [BLOCKCHAIN_NAME.ETHEREUM]: `https://api.etherscan.io/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: `https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}`,
      [BLOCKCHAIN_NAME.POLYGON]: `https://api.polygonscan.com/api?module=account&action=txlist&address=${userAddress}`
    };
    return this.httpService
      .get<ScannerResponse>(blockchainAddressMapper[blockchain.key as SupportedBlockchain])
      .pipe(
        map(response => {
          const approveTransactions =
            typeof response?.result === 'string'
              ? []
              : response?.result.filter(tx => tx?.functionName.includes('approve')).reverse();
          return approveTransactions.map(tx => {
            const decodedData = MethodDecoder.decodeMethod(
              ERC20_TOKEN_ABI.find(method => method.name === 'approve')!,
              tx.input
            );
            const spender = decodedData.params.find(param => param.name === '_spender')!.value;
            const value = decodedData.params.find(param => param.name === '_value')!.value;
            return { hash: tx.hash, tokenAddress: tx.to, spender, value };
          });
        })
      );
  }

  public async showTokenModal(token: string, spender: string): Promise<void> {
    this.dialogService
      .open(new PolymorpheusComponent(RevokeModalComponent, this.injector), {
        size: 'm',
        data: {
          tokenAddress: token,
          spenderAddress: spender,
          blockchain: this.form.controls.blockchain.value.key
        }
      })
      .subscribe();
  }

  private searchStringInTable(
    approves: ApproveTransaction[],
    searchQuery: string
  ): ApproveTransaction[] {
    return searchQuery
      ? approves.filter(tx => {
          const spender = tx.spender.toLowerCase();
          const token = tx.tokenAddress.toLowerCase();
          const txHash = tx.hash.toLowerCase();
          const queryString = searchQuery.toLowerCase();

          return (
            spender.includes(queryString) ||
            token.includes(queryString) ||
            txHash.includes(queryString)
          );
        })
      : approves;
  }

  public async fetchApproveTokenData(
    tokenAddress: string,
    spenderAddress: string
  ): Promise<TokenApproveData> {
    try {
      const blockchain = this.form.controls.blockchain.value.key as EvmBlockchainName;
      const web3 = Injector.web3PublicService.getWeb3Public(blockchain);

      const { decimals, symbol } = await web3.callForTokenInfo(tokenAddress, [
        'decimals',
        'symbol'
      ]);

      const allowance = await web3.getAllowance(
        tokenAddress,
        this.walletConnectorService.address,
        spenderAddress
      );

      await new Promise(resolve => {
        setTimeout(resolve, 2_000);
      });
      const tokenDetails = await this.tokensService.findToken(
        { address: tokenAddress, blockchain: blockchain },
        true
      );
      const maxApprove = new BigNumber(2).pow(256).minus(1);

      return {
        address: tokenAddress,
        spender: spenderAddress,
        symbol,
        image: tokenDetails?.image || 'assets/images/icons/coins/default-token-ico.svg',
        allowance: maxApprove.eq(allowance)
          ? 'Infinity'
          : Web3Pure.fromWei(allowance, Number(decimals)).toFixed()
      };
    } catch {}
  }

  async revokeApprove(tokenAddress: string, spenderAddress: string): Promise<void> {
    const blockchain = this.form.controls.blockchain.value.key as EvmBlockchainName;
    const web3 = Injector.web3PublicService.getWeb3Public(blockchain);
    let revokeProgressNotification: Subscription;

    const allowance = await web3.getAllowance(
      tokenAddress,
      this.walletConnectorService.address,
      spenderAddress
    );
    if (allowance.eq(0)) {
      throw new RubicSdkError('Approve already revoked, token has 0 allowance');
    }

    try {
      await Injector.web3PrivateService
        .getWeb3PrivateByBlockchain(blockchain)
        .approveTokens(tokenAddress, spenderAddress, new BigNumber(0), {
          onTransactionHash: _hash => {
            revokeProgressNotification = this.showProgressNotification();
          }
        });
      this.showSuccessNotification();
    } catch (err) {
      this.handleError(err);
    } finally {
      revokeProgressNotification?.unsubscribe();
    }
  }

  public showProgressNotification(): Subscription {
    return this.notificationsService.show(this.translateService.instant('Revoke in progress'), {
      status: TuiNotification.Info,
      autoClose: false
    });
  }

  public showSuccessNotification(): Subscription {
    return this.notificationsService.show('Revoke is success.', {
      status: TuiNotification.Success,
      autoClose: 10000
    });
  }

  public handleError(err: unknown): void {
    if (err instanceof Error) {
      let label: string;
      let status: TuiNotification;

      if (err instanceof UserRejectError) {
        label = this.translateService.instant('errors.userReject');
        status = TuiNotification.Error;
      } else {
        label = this.translateService.instant('errors.unknown');
        status = TuiNotification.Error;
      }

      this.notificationsService.show(label, { autoClose: 10000, status });
    }
  }
}
