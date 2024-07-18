import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { CommonWalletAdapter } from '../common-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { THEME, TonConnectUI } from '@tonconnect/ui';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { ENVIRONMENT } from 'src/environments/environment';
import { AddressBookResponse } from './models/ton-utils-types';

export class TonConnectAdapter extends CommonWalletAdapter<TonConnectUI> {
  public readonly chainType = CHAIN_TYPE.TON;

  public readonly walletName = WALLET_NAME.TON_CONNECT;

  private readonly tonConnect: TonConnectUI;

  private unsubOnStatusChangeListener: () => void;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);

    this.tonConnect = new TonConnectUI({
      manifestUrl: `https://api.rubic.exchange/api/info/tonconnect/${ENVIRONMENT.environmentName}`,
      uiPreferences: {
        theme: THEME.DARK
      },
      language: 'en'
    });
  }

  public async activate(): Promise<void> {
    try {
      this.listenEvents();
      await this.tonConnect.openModal();

      this.selectedChain = BLOCKCHAIN_NAME.TON;
      this.selectedAddress = this.tonConnect.account?.address;

      this.isEnabled = true;
      this.wallet = this.tonConnect;

      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);
    } catch (err) {
      console.error('[TonConnectAdapter] Activation error - ', err);
      throw err;
    }
  }

  private listenEvents(): void {
    this.unsubOnStatusChangeListener = this.tonConnect.onStatusChange(walletAndWalletInfo => {
      if (walletAndWalletInfo?.account) {
        (async () => {
          const rawAddress = walletAndWalletInfo.account.address;
          const friendlyAddress = await this.fetchFriendlyAddress(rawAddress);
          this.selectedAddress = friendlyAddress;
          this.onAddressChanges$.next(this.selectedAddress);
        })();
      } else {
        this.onAddressChanges$.next(null);
      }
    });
  }

  private async fetchFriendlyAddress(rawAddress: string): Promise<string> {
    const rawRes = await fetch(`https://toncenter.com/api/v3/addressBook?address=${rawAddress}`);
    const res = (await rawRes.json()) as AddressBookResponse;
    const friendly = Object.values(res)[0].user_friendly;
    return friendly;
  }

  public async deactivate(): Promise<void> {
    await this.tonConnect.disconnect();
    this.unsubOnStatusChangeListener();
    super.deactivate();
  }
}
