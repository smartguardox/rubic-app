import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export interface RankedBlockchain {
  name: BlockchainName;
  rank: number;
  tags: string[];
}

const notEvmChangeNowBlockchainsTagsList: Record<NotEvmChangeNowBlockchainsList, string[]> = {
  [BLOCKCHAIN_NAME.ICP]: ['ICP'],
  [BLOCKCHAIN_NAME.CARDANO]: ['ADA'],
  [BLOCKCHAIN_NAME.ALGORAND]: ['ALGO'],
  [BLOCKCHAIN_NAME.DOGECOIN]: ['DOGE'],
  [BLOCKCHAIN_NAME.POLKADOT]: ['DOT'],
  [BLOCKCHAIN_NAME.LITECOIN]: ['LTC'],
  [BLOCKCHAIN_NAME.MONERO]: ['XMR'],
  [BLOCKCHAIN_NAME.RIPPLE]: ['XRP'],
  [BLOCKCHAIN_NAME.ZILLIQA]: ['ZIL'],
  [BLOCKCHAIN_NAME.DASH]: ['DASH'],
  [BLOCKCHAIN_NAME.TEZOS]: ['XTZ'],
  [BLOCKCHAIN_NAME.ASTAR]: ['ASTR'],
  [BLOCKCHAIN_NAME.STELLAR]: ['XLM'],
  [BLOCKCHAIN_NAME.NEO]: ['NEO'],
  [BLOCKCHAIN_NAME.NEAR]: ['NEAR'],
  [BLOCKCHAIN_NAME.SOLANA]: ['SOL'],
  [BLOCKCHAIN_NAME.BITCOIN]: ['BTC'],
  [BLOCKCHAIN_NAME.KAVA_COSMOS]: ['KAVA'],
  [BLOCKCHAIN_NAME.APTOS]: ['APT'],
  [BLOCKCHAIN_NAME.COSMOS]: ['ATOM'],
  [BLOCKCHAIN_NAME.FLOW]: ['FLOW'],
  [BLOCKCHAIN_NAME.HEDERA]: ['HBAR'],
  [BLOCKCHAIN_NAME.IOTA]: ['IOTA'],
  [BLOCKCHAIN_NAME.KUSAMA]: ['KSM'],
  [BLOCKCHAIN_NAME.MINA_PROTOCOL]: ['MINA'],
  [BLOCKCHAIN_NAME.OSMOSIS]: ['OSMO'],
  [BLOCKCHAIN_NAME.SIA]: ['SC'],
  [BLOCKCHAIN_NAME.SECRET]: ['SCRT'],
  [BLOCKCHAIN_NAME.TON]: ['TON'],
  [BLOCKCHAIN_NAME.WAVES]: ['WAVES'],
  [BLOCKCHAIN_NAME.WAX]: ['WAXP'],
  [BLOCKCHAIN_NAME.EOS]: ['EOS'],
  [BLOCKCHAIN_NAME.FILECOIN]: ['FIL'],
  [BLOCKCHAIN_NAME.ONTOLOGY]: ['ONT'],
  [BLOCKCHAIN_NAME.XDC]: ['XDC']
};

export const notEvmChangeNowBlockchainsList = {
  [BLOCKCHAIN_NAME.ICP]: BLOCKCHAIN_NAME.ICP,
  [BLOCKCHAIN_NAME.CARDANO]: BLOCKCHAIN_NAME.CARDANO,
  [BLOCKCHAIN_NAME.ALGORAND]: BLOCKCHAIN_NAME.ALGORAND,
  [BLOCKCHAIN_NAME.DOGECOIN]: BLOCKCHAIN_NAME.DOGECOIN,
  [BLOCKCHAIN_NAME.POLKADOT]: BLOCKCHAIN_NAME.POLKADOT,
  [BLOCKCHAIN_NAME.LITECOIN]: BLOCKCHAIN_NAME.LITECOIN,
  [BLOCKCHAIN_NAME.MONERO]: BLOCKCHAIN_NAME.MONERO,
  [BLOCKCHAIN_NAME.RIPPLE]: BLOCKCHAIN_NAME.RIPPLE,
  [BLOCKCHAIN_NAME.ZILLIQA]: BLOCKCHAIN_NAME.ZILLIQA,
  [BLOCKCHAIN_NAME.DASH]: BLOCKCHAIN_NAME.DASH,
  [BLOCKCHAIN_NAME.TEZOS]: BLOCKCHAIN_NAME.TEZOS,
  [BLOCKCHAIN_NAME.ASTAR]: BLOCKCHAIN_NAME.ASTAR,
  [BLOCKCHAIN_NAME.STELLAR]: BLOCKCHAIN_NAME.STELLAR,
  [BLOCKCHAIN_NAME.NEO]: BLOCKCHAIN_NAME.NEO,
  [BLOCKCHAIN_NAME.NEAR]: BLOCKCHAIN_NAME.NEAR,
  [BLOCKCHAIN_NAME.SOLANA]: BLOCKCHAIN_NAME.SOLANA,
  [BLOCKCHAIN_NAME.BITCOIN]: BLOCKCHAIN_NAME.BITCOIN,
  [BLOCKCHAIN_NAME.KAVA_COSMOS]: BLOCKCHAIN_NAME.KAVA_COSMOS,

  [BLOCKCHAIN_NAME.APTOS]: BLOCKCHAIN_NAME.APTOS,
  [BLOCKCHAIN_NAME.COSMOS]: BLOCKCHAIN_NAME.COSMOS,
  [BLOCKCHAIN_NAME.FLOW]: BLOCKCHAIN_NAME.FLOW,
  [BLOCKCHAIN_NAME.HEDERA]: BLOCKCHAIN_NAME.HEDERA,

  [BLOCKCHAIN_NAME.IOTA]: BLOCKCHAIN_NAME.IOTA,
  [BLOCKCHAIN_NAME.KUSAMA]: BLOCKCHAIN_NAME.KUSAMA,
  [BLOCKCHAIN_NAME.MINA_PROTOCOL]: BLOCKCHAIN_NAME.MINA_PROTOCOL,
  [BLOCKCHAIN_NAME.OSMOSIS]: BLOCKCHAIN_NAME.OSMOSIS,
  [BLOCKCHAIN_NAME.SIA]: BLOCKCHAIN_NAME.SIA,
  [BLOCKCHAIN_NAME.SECRET]: BLOCKCHAIN_NAME.SECRET,
  [BLOCKCHAIN_NAME.TON]: BLOCKCHAIN_NAME.TON,
  [BLOCKCHAIN_NAME.WAVES]: BLOCKCHAIN_NAME.WAVES,
  [BLOCKCHAIN_NAME.WAX]: BLOCKCHAIN_NAME.WAX,
  // [BLOCKCHAIN_NAME.CASPER]: BLOCKCHAIN_NAME.CASPER,

  [BLOCKCHAIN_NAME.EOS]: BLOCKCHAIN_NAME.EOS,
  [BLOCKCHAIN_NAME.FILECOIN]: BLOCKCHAIN_NAME.FILECOIN,
  [BLOCKCHAIN_NAME.ONTOLOGY]: BLOCKCHAIN_NAME.ONTOLOGY,
  [BLOCKCHAIN_NAME.XDC]: BLOCKCHAIN_NAME.XDC
  // [BLOCKCHAIN_NAME.KADENA]: BLOCKCHAIN_NAME.KADENA,
  // [BLOCKCHAIN_NAME.AION]: BLOCKCHAIN_NAME.AION,
  // [BLOCKCHAIN_NAME.ARDOR]: BLOCKCHAIN_NAME.ARDOR,
  // [BLOCKCHAIN_NAME.ARK]: BLOCKCHAIN_NAME.ARK,
  // [BLOCKCHAIN_NAME.STEEM]: BLOCKCHAIN_NAME.STEEM,
  // [BLOCKCHAIN_NAME.BAND_PROTOCOL]: BLOCKCHAIN_NAME.BAND_PROTOCOL,
  // [BLOCKCHAIN_NAME.BITCOIN_DIAMOND]: BLOCKCHAIN_NAME.BITCOIN_DIAMOND,
  // [BLOCKCHAIN_NAME.BSV]: BLOCKCHAIN_NAME.BSV,
  // [BLOCKCHAIN_NAME.BITCOIN_GOLD]: BLOCKCHAIN_NAME.BITCOIN_GOLD,
  // [BLOCKCHAIN_NAME.DECRED]: BLOCKCHAIN_NAME.DECRED,
  // [BLOCKCHAIN_NAME.DIGI_BYTE]: BLOCKCHAIN_NAME.DIGI_BYTE,
  // [BLOCKCHAIN_NAME.DIVI]: BLOCKCHAIN_NAME.DIVI,
  // [BLOCKCHAIN_NAME.MULTIVERS_X]: BLOCKCHAIN_NAME.MULTIVERS_X,
  // [BLOCKCHAIN_NAME.FIO_PROTOCOL]: BLOCKCHAIN_NAME.FIO_PROTOCOL,
  // [BLOCKCHAIN_NAME.FIRO]: BLOCKCHAIN_NAME.FIRO,
  // [BLOCKCHAIN_NAME.HELIUM]: BLOCKCHAIN_NAME.HELIUM,
  // [BLOCKCHAIN_NAME.ICON]: BLOCKCHAIN_NAME.ICON,
  // [BLOCKCHAIN_NAME.IOST]: BLOCKCHAIN_NAME.IOST,
  // [BLOCKCHAIN_NAME.KOMODO]: BLOCKCHAIN_NAME.KOMODO,
  // [BLOCKCHAIN_NAME.LISK]: BLOCKCHAIN_NAME.LISK,
  // [BLOCKCHAIN_NAME.TERRA]: BLOCKCHAIN_NAME.TERRA,
  // [BLOCKCHAIN_NAME.TERRA_CLASSIC]: BLOCKCHAIN_NAME.TERRA_CLASSIC,
  // [BLOCKCHAIN_NAME.NANO]: BLOCKCHAIN_NAME.NANO,
  // [BLOCKCHAIN_NAME.PIVX]: BLOCKCHAIN_NAME.PIVX,
  // [BLOCKCHAIN_NAME.POLYX]: BLOCKCHAIN_NAME.POLYX,
  // [BLOCKCHAIN_NAME.QTUM]: BLOCKCHAIN_NAME.QTUM,
  // [BLOCKCHAIN_NAME.THOR_CHAIN]: BLOCKCHAIN_NAME.THOR_CHAIN,
  // [BLOCKCHAIN_NAME.RAVENCOIN]: BLOCKCHAIN_NAME.RAVENCOIN,
  // [BLOCKCHAIN_NAME.STRATIS]: BLOCKCHAIN_NAME.STRATIS,
  // [BLOCKCHAIN_NAME.STACKS]: BLOCKCHAIN_NAME.STACKS,
  // [BLOCKCHAIN_NAME.SOLAR]: BLOCKCHAIN_NAME.SOLAR,
  // [BLOCKCHAIN_NAME.VE_CHAIN]: BLOCKCHAIN_NAME.VE_CHAIN,
  // [BLOCKCHAIN_NAME.DX_CHAIN]: BLOCKCHAIN_NAME.DX_CHAIN,
  // [BLOCKCHAIN_NAME.E_CASH]: BLOCKCHAIN_NAME.E_CASH,
  // [BLOCKCHAIN_NAME.NEM]: BLOCKCHAIN_NAME.NEM,
  // [BLOCKCHAIN_NAME.VERGE]: BLOCKCHAIN_NAME.VERGE,
  // [BLOCKCHAIN_NAME.SYMBOL]: BLOCKCHAIN_NAME.SYMBOL,
  // [BLOCKCHAIN_NAME.ZCASH]: BLOCKCHAIN_NAME.ZCASH,
  // [BLOCKCHAIN_NAME.HORIZEN]: BLOCKCHAIN_NAME.HORIZEN
};

const notEvmChangeNowFormattedBlockchainsList = Object.values(notEvmChangeNowBlockchainsList).map(
  blockchain => ({
    name: blockchain,
    rank: blockchain === BLOCKCHAIN_NAME.SOLANA ? 1 : 0,
    tags: notEvmChangeNowBlockchainsTagsList[blockchain]
  })
);

export const blockchainsList: RankedBlockchain[] = [
  { name: BLOCKCHAIN_NAME.ETHEREUM, rank: 1, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN, rank: 0.75, tags: ['BNB'] },
  { name: BLOCKCHAIN_NAME.AVALANCHE, rank: 0.75, tags: ['AVAX'] },
  { name: BLOCKCHAIN_NAME.POLYGON, rank: 0.75, tags: ['MATIC'] },
  { name: BLOCKCHAIN_NAME.ARBITRUM, rank: 0.75, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.XLAYER, rank: 0.75, tags: ['OKB'] },
  { name: BLOCKCHAIN_NAME.ZK_SYNC, rank: 0.75, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.SEI, rank: 0.75, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.ROOTSTOCK, rank: 0, tags: ['RBTC'] },
  { name: BLOCKCHAIN_NAME.TAIKO, rank: 0.75, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.LINEA, rank: 0.5, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.SCROLL, rank: 0.5, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.ZETACHAIN, rank: 0.5, tags: ['ZETA'] },
  { name: BLOCKCHAIN_NAME.KROMA, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.MODE, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.BLAST, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.MERLIN, rank: 0, tags: ['BTC'] },
  { name: BLOCKCHAIN_NAME.ZK_FAIR, rank: 0, tags: ['USDC'] },
  { name: BLOCKCHAIN_NAME.ZK_LINK, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.MANTLE, rank: 0, tags: ['MNT'] },
  { name: BLOCKCHAIN_NAME.MANTA_PACIFIC, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.POLYGON_ZKEVM, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.PULSECHAIN, rank: 0, tags: ['PLS'] },
  { name: BLOCKCHAIN_NAME.BASE, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.FANTOM, rank: 0, tags: ['FTM'] },
  { name: BLOCKCHAIN_NAME.BOBA, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.BOBA_BSC, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.TELOS, rank: 0, tags: ['TLOS'] },
  { name: BLOCKCHAIN_NAME.KAVA, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.OPTIMISM, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.AURORA, rank: 0, tags: ['ETH'] },
  { name: BLOCKCHAIN_NAME.OASIS, rank: 0, tags: ['ROSE'] },
  { name: BLOCKCHAIN_NAME.METIS, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.KLAYTN, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.VELAS, rank: 0, tags: ['VLX'] },
  { name: BLOCKCHAIN_NAME.SYSCOIN, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.MOONRIVER, rank: 0, tags: ['MOVR'] },
  { name: BLOCKCHAIN_NAME.TRON, rank: 0, tags: ['TRX'] },
  { name: BLOCKCHAIN_NAME.ASTAR_EVM, rank: 0, tags: ['ASTR'] },
  { name: BLOCKCHAIN_NAME.MOONBEAM, rank: 0, tags: ['GLMR'] },
  { name: BLOCKCHAIN_NAME.FUSE, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.CELO, rank: 0, tags: [] },
  { name: BLOCKCHAIN_NAME.OKE_X_CHAIN, rank: 0, tags: ['OKT'] },
  { name: BLOCKCHAIN_NAME.GNOSIS, rank: 0, tags: ['XDAI'] },
  { name: BLOCKCHAIN_NAME.CRONOS, rank: 0, tags: ['CRO'] },
  { name: BLOCKCHAIN_NAME.HORIZEN_EON, rank: 0, tags: ['ZEN'] },

  // BLOCKCHAIN_NAME.BITGERT,
  // BLOCKCHAIN_NAME.ETHEREUM_POW,
  // BLOCKCHAIN_NAME.BITCOIN_CASH,
  // BLOCKCHAIN_NAME.ETHEREUM_CLASSIC,
  // BLOCKCHAIN_NAME.FLARE,
  // BLOCKCHAIN_NAME.IOTEX,
  // BLOCKCHAIN_NAME.THETA,
  ...notEvmChangeNowFormattedBlockchainsList
];

export const topRankedBlockchains = blockchainsList.map(blockchain => {
  if (blockchain.rank === 1) {
    return blockchain.name;
  }
});

export type NotEvmChangeNowBlockchainsList =
  (typeof notEvmChangeNowBlockchainsList)[keyof typeof notEvmChangeNowBlockchainsList];
