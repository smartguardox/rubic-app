import { BLOCKCHAIN_NAME, ON_CHAIN_TRADE_TYPE } from 'rubic-sdk';
import { OnChainTradeType } from 'rubic-sdk/lib/features/on-chain/calculation-manager/providers/common/models/on-chain-trade-type';
import { SupportedOnChainNetworks } from '@features/trade/constants/instant-trade.type';

const onChainBlacklist: Record<SupportedOnChainNetworks, OnChainTradeType[]> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: [
    ON_CHAIN_TRADE_TYPE.DODO,
    ON_CHAIN_TRADE_TYPE.ZRX,
    ON_CHAIN_TRADE_TYPE.CURVE
  ],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    ON_CHAIN_TRADE_TYPE.DODO,
    ON_CHAIN_TRADE_TYPE.CURVE,
    ON_CHAIN_TRADE_TYPE.ZRX
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    ON_CHAIN_TRADE_TYPE.ALGEBRA,
    ON_CHAIN_TRADE_TYPE.DODO,
    ON_CHAIN_TRADE_TYPE.ZRX,
    ON_CHAIN_TRADE_TYPE.CURVE
  ],
  [BLOCKCHAIN_NAME.POLYGON_ZKEVM]: [],
  [BLOCKCHAIN_NAME.HARMONY]: [],
  [BLOCKCHAIN_NAME.AVALANCHE]: [ON_CHAIN_TRADE_TYPE.ZRX, ON_CHAIN_TRADE_TYPE.CURVE],
  [BLOCKCHAIN_NAME.MOONRIVER]: [ON_CHAIN_TRADE_TYPE.DODO],
  [BLOCKCHAIN_NAME.FANTOM]: [ON_CHAIN_TRADE_TYPE.ZRX, ON_CHAIN_TRADE_TYPE.CURVE],
  [BLOCKCHAIN_NAME.ARBITRUM]: [ON_CHAIN_TRADE_TYPE.DODO, ON_CHAIN_TRADE_TYPE.CURVE],
  [BLOCKCHAIN_NAME.AURORA]: [],
  [BLOCKCHAIN_NAME.TELOS]: [],
  [BLOCKCHAIN_NAME.OPTIMISM]: [
    ON_CHAIN_TRADE_TYPE.ZRX,
    ON_CHAIN_TRADE_TYPE.CURVE,
    ON_CHAIN_TRADE_TYPE.DODO
  ],
  [BLOCKCHAIN_NAME.CRONOS]: [],
  [BLOCKCHAIN_NAME.OKE_X_CHAIN]: [ON_CHAIN_TRADE_TYPE.DODO],
  [BLOCKCHAIN_NAME.GNOSIS]: [ON_CHAIN_TRADE_TYPE.CURVE],
  [BLOCKCHAIN_NAME.FUSE]: [],
  [BLOCKCHAIN_NAME.MOONBEAM]: [],
  [BLOCKCHAIN_NAME.CELO]: [ON_CHAIN_TRADE_TYPE.CURVE],
  [BLOCKCHAIN_NAME.BOBA]: [],
  [BLOCKCHAIN_NAME.ETHEREUM_POW]: [],
  [BLOCKCHAIN_NAME.KAVA]: [],
  [BLOCKCHAIN_NAME.TRON]: [],
  [BLOCKCHAIN_NAME.OASIS]: [],
  [BLOCKCHAIN_NAME.METIS]: [],
  [BLOCKCHAIN_NAME.KLAYTN]: [],
  [BLOCKCHAIN_NAME.VELAS]: [],
  [BLOCKCHAIN_NAME.SYSCOIN]: [],
  [BLOCKCHAIN_NAME.ASTAR_EVM]: [],
  [BLOCKCHAIN_NAME.ZK_SYNC]: [],
  [BLOCKCHAIN_NAME.PULSECHAIN]: [],
  [BLOCKCHAIN_NAME.LINEA]: [ON_CHAIN_TRADE_TYPE.HORIZONDEX],
  [BLOCKCHAIN_NAME.BASE]: [],
  [BLOCKCHAIN_NAME.MANTLE]: [],
  [BLOCKCHAIN_NAME.FUJI]: [],
  [BLOCKCHAIN_NAME.GOERLI]: [],
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: [],
  [BLOCKCHAIN_NAME.MUMBAI]: [],
  [BLOCKCHAIN_NAME.SCROLL_SEPOLIA]: [],
  [BLOCKCHAIN_NAME.ARTHERA]: [],
  [BLOCKCHAIN_NAME.ZETACHAIN]: [],
  [BLOCKCHAIN_NAME.TAIKO]: [],
  [BLOCKCHAIN_NAME.SEPOLIA]: [],
  [BLOCKCHAIN_NAME.MANTA_PACIFIC]: [],
  [BLOCKCHAIN_NAME.SCROLL]: [],
  [BLOCKCHAIN_NAME.STARKNET]: [],
  [BLOCKCHAIN_NAME.BERACHAIN]: [],
  [BLOCKCHAIN_NAME.BLAST]: [],
  [BLOCKCHAIN_NAME.BLAST_TESTNET]: [],
  [BLOCKCHAIN_NAME.HOLESKY]: [],
  [BLOCKCHAIN_NAME.KROMA]: [],
  [BLOCKCHAIN_NAME.HORIZEN_EON]: [],
  [BLOCKCHAIN_NAME.MERLIN]: []
};

export const onChainBlacklistProviders: OnChainTradeType[] = [
  ...new Set(
    Object.values(onChainBlacklist)
      .filter(blockchain => blockchain.length)
      .flat()
  )
];
