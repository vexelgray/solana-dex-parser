import { ClassifiedInstruction, TransferData } from '../../types';
import { MemeEvent } from '../../types/meme';
import { BaseEventParser } from '../base-event-parser';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
export declare class MeteoraDBCEventParser extends BaseEventParser {
    protected adapter: TransactionAdapter;
    protected transferActions: Record<string, TransferData[]>;
    protected utils: TransactionUtils;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeTradeEvent;
    private decodeCreateEvent;
    private decodeDBCMigrateDammEvent;
    private decodeDBCMigrateDammV2Event;
}
