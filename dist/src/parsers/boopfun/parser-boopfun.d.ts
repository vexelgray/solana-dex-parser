import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, DexInfo, TradeInfo, TransferData } from '../../types';
import { BaseParser } from '../base-parser';
/**
 * Parse Boopfun trades (BUY/SELL)
 */
export declare class BoopfunParser extends BaseParser {
    private eventParser;
    constructor(adapter: TransactionAdapter, dexInfo: DexInfo, transferActions: Record<string, TransferData[]>, classifiedInstructions: ClassifiedInstruction[]);
    processTrades(): TradeInfo[];
    private createTradeInfo;
}
