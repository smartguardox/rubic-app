import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  MinimalProvider,
  ProviderData
} from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/models/provider-data';
import { crossChainContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/cross-chain-contract-addresses';
import { SupportedCrossChainBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/supported-cross-chain-blockchain';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import { transitTokens } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/transit-tokens';
import { AbiItem } from 'web3-utils';
import { tuiPure } from '@taiga-ui/cdk';
import { crossChainContractAbiV2 } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/contract-abi/cross-chain-contract-abi-v2';
import { crossChainContractAbiV3 } from '@features/cross-chain-routing/services/cross-chain-routing-service/contract-data/constants/contract-abi/cross-chain-contract-abi-v3';
import { CommonUniV3AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/common/uni-v3-algebra/common-service/common-uni-v3-algebra.service';
import { EthLikeWeb3Public } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { UniSwapV3Service } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3.service';
import { UniSwapV3QuoterController } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/utils/quoter-controller/uni-swap-v3-quoter-controller';
import { UniSwapV3InstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/models/uni-swap-v3-instant-trade';
import { AlgebraQuoterController } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/utils/quoter-controller/algebra-quoter-controller';
import { AlgebraService } from '@features/instant-trade/services/instant-trade-service/providers/polygon/algebra-service/algebra.service';
import { compareAddresses } from '@shared/utils/utils';
import InstantTrade from '@features/instant-trade/models/InstantTrade';

enum TO_OTHER_BLOCKCHAIN_SWAP_METHOD {
  SWAP_TOKENS = 'swapTokensToOtherBlockchain',
  SWAP_CRYPTO = 'swapCryptoToOtherBlockchain'
}

enum TO_USER_SWAP_METHOD {
  SWAP_TOKENS = 'swapTokensToUserWithFee',
  SWAP_CRYPTO = 'swapCryptoToUserWithFee'
}

export class CrossChainContractData {
  @tuiPure
  public get address(): string {
    return crossChainContractAddresses[this.blockchain];
  }

  @tuiPure
  public get transitToken(): InstantTradeToken {
    return transitTokens[this.blockchain];
  }

  constructor(
    public readonly blockchain: SupportedCrossChainBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: number
  ) {}

  public getProvider(providerIndex: number): MinimalProvider {
    return this.providersData[providerIndex].provider;
  }

  private isProviderV3(providerIndex: number): boolean {
    return this.getProvider(providerIndex) instanceof CommonUniV3AlgebraService;
  }

  public getFromMethodNameAndContractAbi(
    providerIndex: number,
    isFromTokenNative: boolean
  ): {
    methodName: string;
    contractAbi: AbiItem[];
  } {
    let methodName: string = isFromTokenNative
      ? TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_CRYPTO
      : TO_OTHER_BLOCKCHAIN_SWAP_METHOD.SWAP_TOKENS;
    let contractAbiMethod = {
      ...crossChainContractAbiV2.find(method => method.name === methodName)
    };

    if (this.isProviderV3(providerIndex)) {
      methodName += 'V3';
      contractAbiMethod = { ...crossChainContractAbiV3.find(method => method.name === methodName) };
    }

    if (this.blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
      methodName += 'AVAX';
    }

    methodName = methodName + this.providersData[providerIndex].methodSuffix;
    contractAbiMethod.name = methodName;

    return {
      methodName,
      contractAbi: [contractAbiMethod]
    };
  }

  public getFromPath(providerIndex: number, instantTrade: InstantTrade): string | string[] {
    if (!instantTrade) {
      return [EthLikeWeb3Public.addressToBytes32(this.transitToken.address)];
    }

    const provider = this.getProvider(providerIndex);

    if (provider instanceof UniSwapV3Service) {
      const route = (instantTrade as UniSwapV3InstantTrade).route;

      return UniSwapV3QuoterController.getEncodedPoolsPath(
        route.poolsPath,
        route.initialTokenAddress
      );
    }

    if (provider instanceof AlgebraService) {
      return AlgebraQuoterController.getEncodedPath(instantTrade.path);
    }

    return instantTrade.path.map(token => token.address);
  }

  public getToPath(providerIndex: number, instantTrade: InstantTrade): string[] {
    if (!instantTrade) {
      return [EthLikeWeb3Public.addressToBytes32(this.transitToken.address)];
    }

    const provider = this.getProvider(providerIndex);

    if (provider instanceof UniSwapV3Service) {
      const route = (instantTrade as UniSwapV3InstantTrade).route;
      const path: string[] = [];
      let lastTokenAddress = route.initialTokenAddress;

      route.poolsPath.forEach(pool => {
        path.push(
          '0x' +
            pool.fee.toString(16).padStart(6, '0').padEnd(24, '0') +
            lastTokenAddress.slice(2).toLowerCase()
        );

        const newToken = compareAddresses(pool.token0.address, lastTokenAddress)
          ? pool.token1
          : pool.token0;
        lastTokenAddress = newToken.address;
      });
      path.push(EthLikeWeb3Public.addressToBytes32(lastTokenAddress));

      return path;
    }

    return instantTrade.path.map(token => EthLikeWeb3Public.addressToBytes32(token.address));
  }

  public getToMethodSignature(providerIndex: number, isToTokenNative: boolean): string {
    let methodName: string = isToTokenNative
      ? TO_USER_SWAP_METHOD.SWAP_CRYPTO
      : TO_USER_SWAP_METHOD.SWAP_TOKENS;
    let contractAbiMethod = crossChainContractAbiV2.find(method => method.name === methodName);

    if (this.isProviderV3(providerIndex)) {
      methodName += 'V3';
      contractAbiMethod = crossChainContractAbiV3.find(method => method.name === methodName);
    }

    if (this.blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
      methodName += 'AVAX';
    }

    methodName = methodName + this.providersData[providerIndex].methodSuffix;

    const parameters = contractAbiMethod.inputs[0].components;
    const paramsSignature = parameters.reduce((acc, parameter, index) => {
      if (index === 0) {
        acc = '((';
      }

      acc += parameter.type;

      if (index === parameters.length - 1) {
        return acc + '))';
      } else {
        return acc + ',';
      }
    }, '');

    return methodName + paramsSignature;
  }
}
