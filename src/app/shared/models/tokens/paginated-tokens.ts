import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface PaginatedPage {
  page: number | null;
  maxPage: number | null;
}

export type PAGINATED_BLOCKCHAIN_NAME = Exclude<
  BLOCKCHAIN_NAME,
  | BLOCKCHAIN_NAME.ETHEREUM_TESTNET
  | BLOCKCHAIN_NAME.XDAI
  | BLOCKCHAIN_NAME.HARMONY_TESTNET
  | BLOCKCHAIN_NAME.POLYGON_TESTNET
  | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET
  | BLOCKCHAIN_NAME.AVALANCHE_TESTNET
  | BLOCKCHAIN_NAME.AURORA_TESTNET
>;

export type TokensNetworkState = Record<PAGINATED_BLOCKCHAIN_NAME, PaginatedPage>;
