import { RefPool } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/near/ref-finance-service/models/ref-pool';

export interface RefFinanceRoute {
  estimate: string;
  pool: RefPool;
}
