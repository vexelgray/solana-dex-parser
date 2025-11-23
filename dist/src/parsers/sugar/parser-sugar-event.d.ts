import { ClassifiedInstruction, TransferData } from '../../types';
import { MemeEvent } from '../../types/meme';
import { BaseEventParser } from '../base-event-parser';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
export declare class SugarEventParser extends BaseEventParser {
    protected adapter: TransactionAdapter;
    protected transferActions: Record<string, TransferData[]>;
    protected utils: TransactionUtils;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeCreateEvent;
    private decodeMigrateEvent;
}
