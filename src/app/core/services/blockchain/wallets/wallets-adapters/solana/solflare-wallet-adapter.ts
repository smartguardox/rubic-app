import { BehaviorSubject } from 'rxjs';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { ErrorsService } from '@core/errors/errors.service';

import { WalletName } from '@core/wallets/components/wallets-modal/models/wallet-name';
import CustomError from '@core/errors/models/custom-error';
import { Connection, PublicKey } from '@solana/web3.js';
import { SolflareWallet } from '@core/services/blockchain/wallets/wallets-adapters/solana/models/types';
import { CommonSolanaWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/solana/common/common-solana-wallet-adapter';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';

export class SolflareWalletAdapter extends CommonSolanaWalletAdapter<SolflareWallet> {
  public get walletName(): WalletName {
    return WalletName.SOLFLARE;
  }

  constructor(
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    connection: Connection
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$, connection);
  }

  public async activate(): Promise<void> {
    const wallet = typeof window !== 'undefined' && window.solflare;
    await this.checkErrors(wallet);

    const publicKey = new PublicKey(wallet.publicKey.toBytes());
    this.isEnabled = true;
    wallet.on('disconnect', this.deActivate);

    this.wallet = wallet;
    this.selectedAddress = publicKey.toBase58();
    this.selectedChain = 'mainnet-beta';

    this.onNetworkChanges$.next(this.getNetwork());
    this.onAddressChanges$.next(this.selectedAddress);
  }

  private async checkErrors(wallet: SolflareWallet): Promise<void> {
    if (!wallet) {
      throw new CustomError('Wallet is not instelled');
    }
    if (!wallet.isSolflare) {
      throw new CustomError('Phantom is not instelled');
    }

    if (!wallet.isConnected) {
      try {
        await wallet.connect();
      } catch (error: unknown) {
        throw new SignRejectError();
      }
    }

    // HACK: Solflare doesn't reject its promise if the popup is closed.
    if (!wallet.publicKey) {
      throw new CustomError('Connection error');
    }
  }
}
