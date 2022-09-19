import { Inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, from, of } from 'rxjs';
import Web3 from 'web3';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { MetamaskWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/metamask-wallet-adapter';
import { WalletConnectAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/wallet-connect-adapter';
import { WalletLinkWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/wallet-link-wallet-adapter';
import { StoreService } from 'src/app/core/services/store/store.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { HttpService } from '@core/services/http/http.service';
import { share } from 'rxjs/operators';
import { TUI_IS_IOS } from '@taiga-ui/cdk';
import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { TrustWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/evm/trust-wallet-adapter';
import { AccountError } from '@core/errors/models/provider/account-error';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { NetworkError } from '@core/errors/models/provider/network-error';
import { WalletError } from '@core/errors/models/provider/wallet-error';
import { NotSupportedNetworkError } from '@core/errors/models/provider/not-supported-network';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { IframeService } from '@core/services/iframe/iframe.service';
import { BitkeepWalletAdapter } from '../wallets-adapters/evm/bitkeep-wallet-adapter';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CHAIN_TYPE,
  EVM_BLOCKCHAIN_NAME,
  WalletProvider
} from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { TronLinkAdapter } from '@core/services/blockchain/wallets/wallets-adapters/tron/tron-link-adapter';
import { switchTap } from '@shared/utils/utils';
import { provider as Web3Provider } from 'web3-core';

@Injectable({
  providedIn: 'root'
})
export class WalletConnectorService {
  private readonly networkChangeSubject$ = new BehaviorSubject<BlockchainData>(null);

  private readonly addressChangeSubject$ = new BehaviorSubject<string>(null);

  private privateProvider: CommonWalletAdapter;

  private readonly TIMEOUT_DELAY = 500;

  public get address(): string | undefined {
    return this.provider?.address;
  }

  public get chainType(): CHAIN_TYPE {
    return this.provider?.walletType;
  }

  public get network(): BlockchainData {
    return this.provider?.network;
  }

  public get networkName(): BlockchainName {
    return this.provider?.networkName;
  }

  public get provider(): CommonWalletAdapter {
    return this.privateProvider;
  }

  public set provider(value: CommonWalletAdapter) {
    this.privateProvider = value;
  }

  // @todo remove after checkSettings removal
  public get isProviderActive(): boolean {
    return Boolean(this.provider?.isActive);
  }

  public readonly networkChange$ = this.networkChangeSubject$.asObservable();

  public readonly addressChange$ = this.addressChangeSubject$.asObservable().pipe(
    // @todo move to sdk service
    switchTap(address => {
      const walletProvider: WalletProvider = address
        ? {
            [this.chainType]: {
              address,
              core: this.provider.wallet as Web3Provider | Web3
            }
          }
        : undefined;
      return walletProvider ? from(this.sdk.patchConfig({ walletProvider })) : of(null);
    }),
    share()
  );

  constructor(
    private readonly storage: StoreService,
    private readonly errorService: ErrorsService,
    private readonly httpService: HttpService,
    private readonly iframeService: IframeService,
    private readonly sdk: RubicSdkService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Inject(TUI_IS_IOS) private readonly isIos: boolean,
    private readonly zone: NgZone
  ) {}

  /**
   * Setup provider based on local storage.
   */
  public async installProvider(): Promise<boolean> {
    const provider = this.storage.getItem('provider');
    if (!provider) {
      return false;
    }
    if (provider === WALLET_NAME.WALLET_LINK) {
      const chainId = this.storage.getItem('chainId');
      return this.connectProvider(provider, chainId);
    }
    return this.connectProvider(provider);
  }

  public getBlockchainsBasedOnWallet(): BlockchainName[] {
    if (this.chainType === CHAIN_TYPE.EVM) {
      return Object.values(EVM_BLOCKCHAIN_NAME);
    }
    return [BLOCKCHAIN_NAME.TRON];
  }

  public async activate(): Promise<void> {
    await this.provider.activate();
    this.storage.setItem('provider', this.provider.walletName);
  }

  public async requestPermissions(): Promise<{ parentCapability: string }[]> {
    return this.provider.requestPermissions();
  }

  public deActivate(): void {
    this.storage.deleteItem('provider');
    return this.provider.deActivate();
  }

  public async connectProvider(walletName: WALLET_NAME, chainId?: number): Promise<boolean> {
    try {
      this.provider = await this.createWalletAdapter(walletName, chainId);
      return true;
    } catch (e) {
      // The error module is triggered before the translation is loaded
      // @TODO fix premature module loading before service load
      setTimeout(() => {
        this.errorService.catch(e);
      }, this.TIMEOUT_DELAY);

      return false;
    }
  }

  private async createWalletAdapter(
    walletName: WALLET_NAME,
    chainId?: number
  ): Promise<CommonWalletAdapter> {
    const walletAdapters: Record<WALLET_NAME, () => Promise<CommonWalletAdapter>> = {
      [WALLET_NAME.TRUST_WALLET]: async () =>
        new TrustWalletAdapter(
          this.addressChangeSubject$,
          this.networkChangeSubject$,
          this.errorService,
          this.zone,
          this.isIos,
          this.window
        ),
      [WALLET_NAME.WALLET_CONNECT]: async () =>
        new WalletConnectAdapter(
          this.addressChangeSubject$,
          this.networkChangeSubject$,
          this.errorService,
          this.zone
        ),
      [WALLET_NAME.METAMASK]: async () => {
        const metamaskWalletAdapter = new MetamaskWalletAdapter(
          this.addressChangeSubject$,
          this.networkChangeSubject$,
          this.errorService,
          this.zone,
          this.window
        );
        await metamaskWalletAdapter.setupDefaultValues();
        return metamaskWalletAdapter;
      },
      [WALLET_NAME.BITKEEP]: async () => {
        const bitkeepWalletAdapter = new BitkeepWalletAdapter(
          this.addressChangeSubject$,
          this.networkChangeSubject$,
          this.errorService,
          this.zone,
          this.window
        );
        await bitkeepWalletAdapter.setupDefaultValues();
        return bitkeepWalletAdapter;
      },
      [WALLET_NAME.WALLET_LINK]: async () =>
        new WalletLinkWalletAdapter(
          this.addressChangeSubject$,
          this.networkChangeSubject$,
          this.errorService,
          this.zone,
          this.window,
          this.storage,
          chainId!
        ),
      [WALLET_NAME.TRON_LINK]: async () => {
        const tronLinkAdapter = new TronLinkAdapter(
          this.addressChangeSubject$,
          this.networkChangeSubject$,
          this.errorService,
          this.zone,
          this.window
        );
        await tronLinkAdapter.setupDefaultValues();
        return tronLinkAdapter;
      }
    };
    return walletAdapters[walletName]();
  }

  // @todo remove
  public checkSettings(selectedBlockchain: BlockchainName): void {
    if (!this.isProviderActive) {
      throw new WalletError();
    }
    if (!this.address) {
      throw new AccountError();
    }

    if (this.networkName !== selectedBlockchain) {
      if (this.provider.walletName === WALLET_NAME.METAMASK) {
        throw new NetworkError(selectedBlockchain);
      } else if (!this.provider.isMultiChainWallet) {
        throw new NotSupportedNetworkError(selectedBlockchain);
      }
    }
  }

  public async addChain(networkName: BlockchainName): Promise<void> {
    const network = BlockchainsInfo.getBlockchainByName(networkName);
    const defaultData = {
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        name: 'Binance Smart Chain Mainnet',
        rpc: 'https://bsc-dataseed1.binance.org'
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        name: 'Polygon Mainnet',
        rpc: 'https://rpc-mainnet.maticvigil.com'
      },
      [BLOCKCHAIN_NAME.HARMONY]: {
        name: 'Harmony Mainnet Shard 0',
        rpc: 'https://api.harmony.one'
      },
      [BLOCKCHAIN_NAME.AVALANCHE]: {
        name: 'Avalanche Mainnet',
        rpc: 'https://api.avax.network/ext/bc/C/rpc'
      },
      [BLOCKCHAIN_NAME.MOONRIVER]: {
        name: 'Moonriver',
        rpc: 'https://rpc.moonriver.moonbeam.network'
      },
      [BLOCKCHAIN_NAME.FANTOM]: {
        name: 'Fantom Opera',
        rpc: 'https://rpc.ankr.com/fantom'
      },
      [BLOCKCHAIN_NAME.ARBITRUM]: {
        name: 'Arbitrum One',
        rpc: 'https://arb1.arbitrum.io/rpc'
      },
      [BLOCKCHAIN_NAME.AURORA]: {
        name: 'Aurora MainNet',
        rpc: 'https://mainnet.aurora.dev'
      },
      [BLOCKCHAIN_NAME.TELOS]: {
        name: 'Telos EVM Mainnet',
        rpc: 'https://mainnet.telos.net/evm'
      },
      [BLOCKCHAIN_NAME.OPTIMISM]: {
        name: 'Optimism',
        rpc: 'https://mainnet.optimism.io'
      },
      [BLOCKCHAIN_NAME.CRONOS]: {
        name: 'Cronos Mainnet Beta',
        rpc: 'https://evm.cronos.org'
      },
      [BLOCKCHAIN_NAME.OKE_X_CHAIN]: {
        name: 'OKXChain Mainnet',
        rpc: 'https://exchainrpc.okex.org'
      },
      [BLOCKCHAIN_NAME.GNOSIS]: {
        name: 'Gnosis Chain',
        rpc: 'https://rpc.gnosischain.com'
      },
      [BLOCKCHAIN_NAME.FUSE]: {
        name: 'Fuse Mainnet',
        rpc: 'https://rpc.fuse.io'
      },
      [BLOCKCHAIN_NAME.MOONBEAM]: {
        name: 'Moonbeam',
        rpc: 'https://rpc.api.moonbeam.network'
      },
      [BLOCKCHAIN_NAME.CELO]: {
        name: 'Celo Mainnet',
        rpc: 'https://forno.celo.org'
      }
    };
    const params = {
      chainId: `0x${network.id.toString(16)}`,
      chainName: defaultData[network.name as keyof typeof defaultData]?.name || network.name,
      nativeCurrency: {
        name: network.nativeCoin.name,
        symbol: network.nativeCoin.symbol,
        decimals: 18
      },
      rpcUrls: [defaultData[network.name as keyof typeof defaultData]?.rpc || network.rpcList[0]],
      blockExplorerUrls: [network.scannerUrl],
      iconUrls: [`${this.window.location.origin}/${network.imagePath}`]
    } as AddEthChainParams;
    await this.provider.addChain(params);
  }

  /**
   * Prompts the user to switch the network, or add it to the wallet if the network has not been added yet.
   * @param networkName chain to switch to.
   * @return was the network switch successful.
   */
  public async switchChain(networkName: BlockchainName): Promise<boolean> {
    const network = BlockchainsInfo.getBlockchainByName(networkName);
    const chainId = `0x${network.id.toString(16)}`;
    try {
      await this.provider.switchChain(chainId);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await this.addChain(networkName);
          await this.provider.switchChain(chainId);
          return true;
        } catch (err) {
          this.errorService.catch(err);
          return false;
        }
      } else {
        this.errorService.catch(switchError);
        return false;
      }
    }
  }
}
