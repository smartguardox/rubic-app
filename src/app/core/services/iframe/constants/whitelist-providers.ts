import { BLOCKCHAIN_NAME, BlockchainName, ON_CHAIN_TRADE_TYPE, OnChainTradeType } from 'rubic-sdk';

export const WHITELIST_PROVIDERS: Partial<Record<BlockchainName, OnChainTradeType[]>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [
    ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP,
    ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    ON_CHAIN_TRADE_TYPE.ONE_INCH,
    ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    ON_CHAIN_TRADE_TYPE.DODO,
    ON_CHAIN_TRADE_TYPE.ZRX
  ],
  [BLOCKCHAIN_NAME.POLYGON]: [
    ON_CHAIN_TRADE_TYPE.QUICK_SWAP,
    ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    ON_CHAIN_TRADE_TYPE.ONE_INCH,
    ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    ON_CHAIN_TRADE_TYPE.DODO,
    ON_CHAIN_TRADE_TYPE.HONEY_SWAP,
    ON_CHAIN_TRADE_TYPE.ZRX
  ],
  [BLOCKCHAIN_NAME.FANTOM]: [
    ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP,
    ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP,
    ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    ON_CHAIN_TRADE_TYPE.ZRX
  ],
  [BLOCKCHAIN_NAME.AVALANCHE]: [
    ON_CHAIN_TRADE_TYPE.JOE,
    ON_CHAIN_TRADE_TYPE.PANGOLIN,
    ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    ON_CHAIN_TRADE_TYPE.ZRX
  ],
  [BLOCKCHAIN_NAME.HARMONY]: [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP, ON_CHAIN_TRADE_TYPE.VIPER_SWAP],
  [BLOCKCHAIN_NAME.MOONRIVER]: [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP, ON_CHAIN_TRADE_TYPE.DODO],
  [BLOCKCHAIN_NAME.ARBITRUM]: [
    ON_CHAIN_TRADE_TYPE.SUSHI_SWAP,
    ON_CHAIN_TRADE_TYPE.ONE_INCH,
    ON_CHAIN_TRADE_TYPE.OPEN_OCEAN,
    ON_CHAIN_TRADE_TYPE.DODO
  ]
};
