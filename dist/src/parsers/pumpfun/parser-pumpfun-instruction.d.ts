import { InstructionClassifier } from '../../instruction-classifier';
import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction } from '../../types';
export declare class PumpfunInstructionParser {
    private readonly adapter;
    private readonly classifier;
    constructor(adapter: TransactionAdapter, classifier: InstructionClassifier);
    private readonly instructionParsers;
    processInstructions(): any[];
    parseInstructions(instructions: ClassifiedInstruction[]): any[];
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeCreateEvent;
    private decodeMigrateEvent;
}
