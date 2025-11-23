import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, MemeEvent, TransferData } from '../../types';
export declare class RaydiumLaunchpadEventParser {
    private readonly adapter;
    private readonly transferActions;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    private readonly EventsParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeTradeInstruction;
    private decodeCreateEvent;
    private decodeCompleteInstruction;
}
