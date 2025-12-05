import { TokenInfo, TradeType } from './trade';
export interface BaseTokenInfo {
    mint: string;
    name: string;
    symbol: string;
    uri: string;
    decimals: number;
    totalSupply: number;
    programId?: string;
}
export interface QuoteTokenInfo {
    mint: string;
    symbol: string;
    decimals: number;
}
export interface MemeEvent {
    type: TradeType;
    timestamp: number;
    idx: string;
    slot: number;
    signature: string;
    user: string;
    baseToken?: BaseTokenInfo;
    quoteToken?: QuoteTokenInfo;
    creatorAddress?: string;
    baseMint?: string;
    quoteMint?: string;
    inputToken?: TokenInfo;
    outputToken?: TokenInfo;
    fee?: number;
    feeRaw?: string;
    feeMint?: string;
    feeDecimals?: number;
    protocolFee?: number;
    platformFee?: number;
    shareFee?: number;
    creatorFee?: number;
    protocol?: string;
    launchpad?: string;
    platform?: string;
    configAddress?: string;
    poolAddress?: string;
    pool?: string;
    poolDex?: string;
    poolAReserve?: number;
    poolBReserve?: number;
    poolFeeRate?: number;
    migratedTokenAmount?: number;
    migratedSolAmount?: number;
    migrationFee?: number;
    curveType?: string;
    curveBaseReserves?: number;
    curveQuoteReserves?: number;
    vaultBaseReserves?: number;
    vaultQuoteReserves?: number;
    initialSaleSupply?: number;
    graduationThreshold?: number;
}
