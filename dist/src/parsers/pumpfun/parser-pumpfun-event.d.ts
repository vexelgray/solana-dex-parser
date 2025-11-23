import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, MemeEvent, TransferData } from '../../types';
export declare class PumpfunEventParser {
    private readonly adapter;
    private readonly transferActions;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeTradeEvent;
    private decodeCreateEvent;
    private decodeCompleteEvent;
    private decodeMigrateEvent;
}
