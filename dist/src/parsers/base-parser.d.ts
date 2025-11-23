import { TransactionAdapter } from '../transaction-adapter';
import { TransactionUtils } from '../transaction-utils';
import { ClassifiedInstruction, DexInfo, TradeInfo, TransferData } from '../types';
export declare abstract class BaseParser {
    protected readonly adapter: TransactionAdapter;
    protected readonly dexInfo: DexInfo;
    protected readonly transferActions: Record<string, TransferData[]>;
    protected readonly classifiedInstructions: ClassifiedInstruction[];
    protected readonly utils: TransactionUtils;
    constructor(adapter: TransactionAdapter, dexInfo: DexInfo, transferActions: Record<string, TransferData[]>, classifiedInstructions: ClassifiedInstruction[]);
    abstract processTrades(): TradeInfo[];
    protected getTransfersForInstruction(programId: string, outerIndex: number, innerIndex?: number, extraTypes?: string[]): TransferData[];
}
