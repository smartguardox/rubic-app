import { BehaviorSubject } from 'rxjs';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import Web3 from 'web3';
import WalletConnect from '@walletconnect/web3-provider';
import networks from 'src/app/shared/constants/blockchain/networks';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { WalletConnectAbstractProvider } from '@core/services/blockchain/providers/common/wallet-connect-abstract';

export class WalletConnectProvider extends WalletConnectAbstractProvider {
  constructor(
    web3: Web3,
    chainChange$: BehaviorSubject<IBlockchain>,
    accountChange$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    availableMobileWallets?: string[]
  ) {
    const rpcParams: Record<typeof networks[number]['id'], string> = networks
      .filter(network => isFinite(network.id))
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur.id]: cur.rpcLink
        };
      }, {});
    const core = new WalletConnect({
      rpc: rpcParams,
      bridge: 'https://bridge.walletconnect.org',
      qrcode: true,
      qrcodeModalOptions: {
        mobileLinks: availableMobileWallets
      }
    });
    super(web3, chainChange$, accountChange$, errorsService, core);
  }
}
