import { MemeEvent, DexInfo, TradeInfo } from '../../types';
export declare const getBoopfunTradeInfo: (event: MemeEvent, info: {
    slot: number;
    signature: string;
    timestamp: number;
    idx?: string;
    dexInfo?: DexInfo;
}) => TradeInfo;
