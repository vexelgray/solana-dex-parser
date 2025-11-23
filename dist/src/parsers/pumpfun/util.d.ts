import { DexInfo, MemeEvent, PumpswapBuyEvent, PumpswapSellEvent, TradeInfo } from '../../types';
export declare const getPumpfunTradeInfo: (event: MemeEvent, info: {
    slot: number;
    signature: string;
    timestamp: number;
    idx?: string;
    dexInfo?: DexInfo;
}) => TradeInfo;
export declare const getPumpswapBuyInfo: (event: PumpswapBuyEvent, inputToken: {
    mint: string;
    decimals: number;
}, outputToken: {
    mint: string;
    decimals: number;
}, feeToken: {
    mint: string;
    decimals: number;
}, info: {
    slot: number;
    signature: string;
    timestamp: number;
    idx?: string;
    dexInfo?: DexInfo;
}) => TradeInfo;
export declare const getPumpswapSellInfo: (event: PumpswapSellEvent, inputToken: {
    mint: string;
    decimals: number;
}, outputToken: {
    mint: string;
    decimals: number;
}, feeToken: {
    mint: string;
    decimals: number;
}, info: {
    slot: number;
    signature: string;
    timestamp: number;
    idx?: string;
    dexInfo?: DexInfo;
}) => TradeInfo;
