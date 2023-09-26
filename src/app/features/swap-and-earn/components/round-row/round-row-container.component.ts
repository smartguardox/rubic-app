import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { SwapAndEarnFacadeService } from '@features/swap-and-earn/services/swap-and-earn-facade.service';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { newRubicToken } from '@features/swap-and-earn/constants/airdrop/airdrop-token';
import { HeaderStore } from '@core/header/services/header.store';
import { WINDOW } from '@ng-web-apis/common';
import { SwapAndEarnStateService } from '@features/swap-and-earn/services/swap-and-earn-state.service';
import { SwapAndEarnPopupService } from '@features/swap-and-earn/services/swap-and-earn-popup.service';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RetrodropStakeModalComponent } from '@features/swap-and-earn/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { TuiDialogService } from '@taiga-ui/core';
import { SenTab } from '@features/swap-and-earn/models/swap-to-earn-tabs';

type ButtonLabel =
  | 'login'
  | 'emptyError'
  | 'wrongAddressError'
  | 'changeNetwork'
  | 'claim'
  | 'stake'
  | 'claimed'
  | 'staked'
  | 'incorrectAddressError';

interface ButtonState {
  label: ButtonLabel;
  translation: string;
  isError: boolean;
}

@Component({
  selector: 'app-round-row-container',
  templateUrl: './round-row-container.component.html',
  styleUrls: ['./round-row-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoundRowContainerComponent {
  @Input() public readonly claimData: string = '';

  @Input() public readonly roundNumber: string = '1';

  @Input() public readonly disabled: boolean = false;

  @Input() public readonly isAlreadyClaimed: boolean;

  @Input() public readonly isClosed: boolean;

  public readonly claimAmount$ = this.swapAndEarnFacadeService.claimedTokens$;

  public readonly currentTab$ = this.swapAndEarnStateService.currentTab$;

  public readonly isAirdropAddressValid$ = this.swapAndEarnFacadeService.isAirdropAddressValid$;

  public readonly isRetrodropAddressValid$ = this.swapAndEarnFacadeService.isRetrodropAddressValid$;

  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    stake: 'airdrop.button.stake',
    claimed: 'airdrop.button.claimed',
    staked: 'airdrop.button.staked',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    incorrectAddressError: 'airdrop.button.incorrectAddressError'
  };

  public isMobile = false;

  public buttonState$: Observable<ButtonState> = this.swapAndEarnStateService.currentTab$.pipe(
    combineLatestWith(
      this.swapAndEarnFacadeService.isRetrodropAddressValid$,
      this.swapAndEarnFacadeService.isAirdropAddressValid$,
      this.authService.currentUser$,
      this.walletConnectorService.networkChange$,
      this.swapAndEarnFacadeService.isAlreadyClaimed$
    ),
    map(
      ([
        currentTab,
        isRetrodropAddressValid,
        isAirdropAddressValid,
        user,
        network,
        isAlreadyClaimed
      ]) => {
        const isValid = currentTab === 'airdrop' ? isAirdropAddressValid : isRetrodropAddressValid;
        const buttonLabel = this.getButtonKey([
          currentTab,
          isValid,
          user,
          network,
          isAlreadyClaimed
        ]);

        return {
          label: buttonLabel,
          translation: this.buttonStateNameMap[buttonLabel],
          isError: this.getErrorState(buttonLabel)
        };
      }
    ),
    startWith({
      label: 'emptyError' as ButtonLabel,
      translation: this.buttonStateNameMap['emptyError'],
      isError: false
    })
  );

  public readonly loading$ = this.swapAndEarnFacadeService.claimLoading$;

  constructor(
    private readonly swapAndEarnFacadeService: SwapAndEarnFacadeService,
    private readonly swapAndEarnStateService: SwapAndEarnStateService,
    private readonly popupService: SwapAndEarnPopupService,
    private readonly web3Service: SwapAndEarnWeb3Service,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletModalService: WalletsModalService,
    private readonly headerService: HeaderStore,
    private readonly dialogService: TuiDialogService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    if (this.window.innerWidth <= 900) {
      this.isMobile = true;
    }
  }

  public async handleClaim(): Promise<void> {
    await this.swapAndEarnFacadeService.claimTokens();
  }

  public async handleClick(state: ButtonLabel): Promise<void> {
    switch (state) {
      case 'changeNetwork':
        await this.swapAndEarnFacadeService.changeNetwork();
        break;
      case 'login':
        this.walletModalService.open$();
        break;
      case 'claim':
        await this.swapAndEarnFacadeService.claimTokens();
        break;
      case 'stake':
        this.showStakeConfirmModal();
        break;
      default:
    }
  }

  private getButtonKey([tab, isValid, user, network, isAlreadyClaimed]: [
    SenTab,
    boolean,
    UserInterface,
    BlockchainName,
    boolean
  ]): ButtonLabel {
    if (!user?.address) {
      return 'login';
    }
    if (!network || network !== newRubicToken.blockchain) {
      return 'changeNetwork';
    }
    if (isAlreadyClaimed) {
      if (tab === 'airdrop') {
        return 'claimed';
      } else {
        return 'staked';
      }
    }
    if (isValid) {
      if (tab === 'airdrop') {
        return 'claim';
      } else {
        return 'stake';
      }
    }

    const address = this.walletConnectorService.address;
    if (!Boolean(address)) {
      return 'emptyError';
    }

    const isEthAddress = EvmWeb3Pure.isAddressCorrect(address);
    return isEthAddress ? 'wrongAddressError' : 'incorrectAddressError';
  }

  private getErrorState(buttonLabel: ButtonLabel): boolean {
    return buttonLabel === 'wrongAddressError' || buttonLabel === 'incorrectAddressError';
  }

  public showStakeConfirmModal(): Subscription {
    return this.dialogService
      .open(new PolymorpheusComponent(RetrodropStakeModalComponent), {
        size: 's'
      })
      .subscribe(() => {
        this.swapAndEarnFacadeService.claimTokens(false, true);
      });
  }
}
