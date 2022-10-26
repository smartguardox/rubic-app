import { OnChainTradeType, ON_CHAIN_TRADE_TYPE } from 'rubic-sdk';

export const BACKEND_PROVIDERS: Record<OnChainTradeType, string> = {
  // Missed dexes
  [ON_CHAIN_TRADE_TYPE.ACRYPTOS]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ALDRIN_EXCHANGE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ANNEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.APE_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ARTH_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.AURORA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.BABY_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.BALANCER]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.BI_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CREMA_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CROPPER_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CROW_FI]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CRO_DEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.CURVE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DEFI_PLAZA]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DEFI_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DFYN]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.DYSTOPIA]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.JET_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.JUPITER]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.KYBER_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.LUA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MAVERICK]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MDEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MESH_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MM_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.MOJITO_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ONE_MOON]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ONE_SOL]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ORCA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.OSMOSIS_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.POLYDEX]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SABER_STABLE_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SAROS_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SERUM]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SHIBA_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SMOOTHY]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.SPL_TOKEN_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.VOLTAGE_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.VVS_FINANCE]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.WAULT_SWAP]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.WOO_FI]: 'unknown',
  [ON_CHAIN_TRADE_TYPE.ZIP_SWAP]: 'unknown',
  // Rubic integrated dexes
  [ON_CHAIN_TRADE_TYPE.ALGEBRA]: 'algebra',
  [ON_CHAIN_TRADE_TYPE.JOE]: 'joe',
  [ON_CHAIN_TRADE_TYPE.ONE_INCH]: 'oneinch',
  [ON_CHAIN_TRADE_TYPE.PANCAKE_SWAP]: 'pancakeswap',
  [ON_CHAIN_TRADE_TYPE.PANGOLIN]: 'pangolin',
  [ON_CHAIN_TRADE_TYPE.QUICK_SWAP]: 'quickswap',
  [ON_CHAIN_TRADE_TYPE.RAYDIUM]: 'raydium',
  [ON_CHAIN_TRADE_TYPE.SOLAR_BEAM]: 'solarbeam',
  [ON_CHAIN_TRADE_TYPE.SPIRIT_SWAP]: 'spiritswap',
  [ON_CHAIN_TRADE_TYPE.SPOOKY_SWAP]: 'spookyswap',
  [ON_CHAIN_TRADE_TYPE.SUSHI_SWAP]: 'sushiswap',
  [ON_CHAIN_TRADE_TYPE.TRISOLARIS]: 'trisolaris',
  [ON_CHAIN_TRADE_TYPE.UNISWAP_V2]: 'uniswap',
  [ON_CHAIN_TRADE_TYPE.UNI_SWAP_V3]: 'uniswap3',
  [ON_CHAIN_TRADE_TYPE.VIPER_SWAP]: 'viper',
  [ON_CHAIN_TRADE_TYPE.WANNA_SWAP]: 'wannaswap',
  [ON_CHAIN_TRADE_TYPE.WRAPPED]: 'wrapped',
  [ON_CHAIN_TRADE_TYPE.ZAPPY]: 'zappy',
  [ON_CHAIN_TRADE_TYPE.ZRX]: 'zerox',
  [ON_CHAIN_TRADE_TYPE.OOLONG_SWAP]: 'oolong',
  [ON_CHAIN_TRADE_TYPE.JUPITER_SWAP]: 'jupiter',
  [ON_CHAIN_TRADE_TYPE.PHOTON_SWAP]: 'photon',

  // Li-fi dexes
  [ON_CHAIN_TRADE_TYPE.CRONA_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.BEAM_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.HONEY_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.DODO]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.J_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.OPEN_OCEAN]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.REF_FINANCE]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.PARA_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.STELLA_SWAP]: 'lifi',
  [ON_CHAIN_TRADE_TYPE.UBE_SWAP]: 'lifi',

  [ON_CHAIN_TRADE_TYPE.REN_BTC]: 'renbtc',

  [ON_CHAIN_TRADE_TYPE.BRIDGERS]: 'bridgers'
};
