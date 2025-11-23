import { DexInfo, MemeEvent, TradeInfo } from '../../types';
export declare const getRaydiumTradeInfo: (event: MemeEvent, inputToken: {
    mint: string;
    decimals: number;
}, outputToken: {
    mint: string;
    decimals: number;
}, info: {
    slot: number;
    signature: string;
    timestamp: number;
    idx?: string;
    dexInfo?: DexInfo;
}) => TradeInfo;
