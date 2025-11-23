import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, DexInfo, TradeInfo, TransferData } from '../../types';
import { BaseParser } from '../base-parser';
export declare class PumpswapParser extends BaseParser {
    private eventParser;
    constructor(adapter: TransactionAdapter, dexInfo: DexInfo, transferActions: Record<string, TransferData[]>, classifiedInstructions: ClassifiedInstruction[]);
    processTrades(): TradeInfo[];
    private createBuyInfo;
    private createSellInfo;
}
