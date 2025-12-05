import { TransactionAdapter } from '../transaction-adapter';
import { MemeEvent, TransferData } from '../types';
export declare abstract class BaseEventParser {
    protected readonly adapter: TransactionAdapter;
    protected readonly transferActions: Record<string, TransferData[]>;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    abstract processEvents(): MemeEvent[];
    protected getTransfersForInstruction(programId: string, outerIndex: number, innerIndex?: number): TransferData[];
}
