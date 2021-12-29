import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

export const instantTradesLabels: Record<INSTANT_TRADES_PROVIDER, string> = {
  [INSTANT_TRADES_PROVIDER.ONEINCH]: '1inch',
  [INSTANT_TRADES_PROVIDER.UNISWAP_V2]: 'Uniswap V2',
  [INSTANT_TRADES_PROVIDER.UNISWAP_V3]: 'Uniswap V3',
  [INSTANT_TRADES_PROVIDER.PANCAKESWAP]: 'Pancakeswap',
  [INSTANT_TRADES_PROVIDER.QUICKSWAP]: 'Quickswap',
  [INSTANT_TRADES_PROVIDER.SUSHISWAP]: 'Sushiswap',
  [INSTANT_TRADES_PROVIDER.ZRX]: '0x',
  [INSTANT_TRADES_PROVIDER.PANGOLIN]: 'Pangolin',
  [INSTANT_TRADES_PROVIDER.JOE]: 'Joe',
  [INSTANT_TRADES_PROVIDER.SOLARBEAM]: 'Solarbeam',
  [INSTANT_TRADES_PROVIDER.SPOOKYSWAP]: 'Spookyswap',
  [INSTANT_TRADES_PROVIDER.SPIRITSWAP]: 'Spiritswap',
  [INSTANT_TRADES_PROVIDER.WRAPPED]: 'Wrapped',
  [INSTANT_TRADES_PROVIDER.RAYDIUM]: 'Raydium',
  [INSTANT_TRADES_PROVIDER.ALGEBRA]: 'Algebra'
};
