import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  INJECTOR,
  Injector,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletsModalComponent } from 'src/app/core/header/components/header/components/wallets-modal/wallets-modal.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TRADE_STATUS } from '../../../models/swaps/TRADE_STATUS';

enum ERROR_TYPE {
  INSUFFICIENT_FUNDS = 'Insufficient balance',
  WRONG_BLOCKCHAIN = 'Wrong network'
}

@Component({
  selector: 'app-swap-button',
  templateUrl: './swap-button.component.html',
  styleUrls: ['./swap-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapButtonComponent implements OnInit {
  @Input() needApprove: boolean;

  @Input() status: TRADE_STATUS;

  @Input() formService: FormService;

  @Input() set fromAmount(value: BigNumber) {
    this._fromAmount = value;
    this.checkInsufficientFundsError();
  }

  @Output() approveClick = new EventEmitter<void>();

  @Output() swapClick = new EventEmitter<void>();

  @Output() loginEvent = new EventEmitter<void>();

  public TRADE_STATUS = TRADE_STATUS;

  public needLogin: Observable<boolean>;

  public loading: boolean;

  public errorType: Record<ERROR_TYPE, boolean>;

  private isTestingMode: boolean;

  private fromToken: TokenAmount;

  private _fromAmount: BigNumber;

  get hasError(): boolean {
    return !!Object.values(ERROR_TYPE).find(key => this.errorType[key]);
  }

  // eslint-disable-next-line consistent-return
  get errorText(): string {
    if (this.errorType[ERROR_TYPE.INSUFFICIENT_FUNDS]) {
      return 'Insufficient balance';
    }
    if (this.errorType[ERROR_TYPE.WRONG_BLOCKCHAIN]) {
      return `Choose ${this.fromToken.blockchain} network`;
    }
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly dialogService: TuiDialogService,
    @Inject(INJECTOR) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.needApprove = false;
    this.needLogin = this.authService.getCurrentUser().pipe(map(user => !user?.address));

    this.loading = true;

    this.errorType = Object.values(ERROR_TYPE).reduce(
      (acc, key) => ({
        ...acc,
        [key]: false
      }),
      {}
    ) as Record<ERROR_TYPE, boolean>;

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      this.isTestingMode = isTestingMode;
    });

    this.setFormValues(this.formService.commonTrade.controls.input.value);
    this.formService.commonTrade.controls.input.valueChanges.subscribe(form => {
      this.setFormValues(form);
    });

    this.providerConnectorService.$networkChange.subscribe(() => {
      this.checkWrongBlockchainError();
    });
  }

  private setFormValues(form: ISwapFormInput): void {
    this.fromToken = form.fromToken;
    this.checkErrors();
  }

  private checkErrors(): void {
    this.checkInsufficientFundsError();
    this.checkWrongBlockchainError();
  }

  private checkInsufficientFundsError(): void {
    if (!this._fromAmount || !this.fromToken) {
      this.loading = false;
      return;
    }

    if (this.fromToken.amount.isNaN()) {
      this.loading = true;
      return;
    }

    this.errorType[ERROR_TYPE.INSUFFICIENT_FUNDS] = this.fromToken.amount.lt(this._fromAmount);

    this.loading = false;
    this.cdr.detectChanges();
  }

  private checkWrongBlockchainError(): void {
    const fromBlockchain = this.fromToken?.blockchain;
    const userBlockchain = this.providerConnectorService.network?.name;

    if (
      fromBlockchain &&
      userBlockchain &&
      fromBlockchain !== userBlockchain &&
      (!this.isTestingMode || `${fromBlockchain}_TESTNET` === userBlockchain)
    ) {
      this.errorType[ERROR_TYPE.WRONG_BLOCKCHAIN] = true;
    } else {
      this.errorType[ERROR_TYPE.WRONG_BLOCKCHAIN] = false;
    }

    this.cdr.detectChanges();
  }

  public onLogin() {
    this.dialogService
      .open(new PolymorpheusComponent(WalletsModalComponent, this.injector), { size: 's' })
      .subscribe(() => this.loginEvent.emit());
  }
}
