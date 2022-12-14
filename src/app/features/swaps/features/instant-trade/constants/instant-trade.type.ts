import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

const nonOnChainNetworks = [
  BLOCKCHAIN_NAME.BITGERT,
  BLOCKCHAIN_NAME.ASTAR,
  BLOCKCHAIN_NAME.BITCOIN,
  BLOCKCHAIN_NAME.DFK
] as const;
type NonOnChainNetworks = typeof nonOnChainNetworks[number];

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
