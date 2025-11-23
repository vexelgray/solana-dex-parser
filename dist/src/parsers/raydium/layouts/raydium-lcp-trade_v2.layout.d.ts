import { PoolStatus, RaydiumLCPTradeEvent, TradeDirection } from '../../../types/raydium';
export declare class RaydiumLCPTradeV2Layout {
    poolState: Uint8Array;
    totalBaseSell: bigint;
    virtualBase: bigint;
    virtualQuote: bigint;
    realBaseBefore: bigint;
    realQuoteBefore: bigint;
    realBaseAfter: bigint;
    realQuoteAfter: bigint;
    amountIn: bigint;
    amountOut: bigint;
    protocolFee: bigint;
    platformFee: bigint;
    creatorFee: bigint;
    shareFee: bigint;
    tradeDirection: TradeDirection;
    poolStatus: PoolStatus;
    constructor(fields: {
        poolState: Uint8Array;
        totalBaseSell: bigint;
        virtualBase: bigint;
        virtualQuote: bigint;
        realBaseBefore: bigint;
        realQuoteBefore: bigint;
        realBaseAfter: bigint;
        realQuoteAfter: bigint;
        amountIn: bigint;
        amountOut: bigint;
        protocolFee: bigint;
        platformFee: bigint;
        creatorFee: bigint;
        shareFee: bigint;
        tradeDirection: TradeDirection;
        poolStatus: PoolStatus;
    });
    static schema: Map<typeof RaydiumLCPTradeV2Layout, {
        kind: string;
        fields: (string | number[])[][];
    }>;
    toObject(): RaydiumLCPTradeEvent;
}
