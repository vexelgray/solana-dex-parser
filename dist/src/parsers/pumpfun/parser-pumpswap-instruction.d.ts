import { InstructionClassifier } from '../../instruction-classifier';
import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, PumpswapEvent } from '../../types';
export declare class PumpswapInstructionParser {
    private readonly adapter;
    private readonly classifier;
    constructor(adapter: TransactionAdapter, classifier: InstructionClassifier);
    private readonly instructionParsers;
    processInstructions(): PumpswapEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): PumpswapEvent[];
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeAddLiquidity;
    private decodeCreateEvent;
    private decodeRemoveLiquidity;
}
