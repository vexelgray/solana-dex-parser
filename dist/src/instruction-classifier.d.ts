import { TransactionAdapter } from './transaction-adapter';
import { ClassifiedInstruction } from './types/common';
export declare class InstructionClassifier {
    private adapter;
    private instructionMap;
    constructor(adapter: TransactionAdapter);
    private classifyInstructions;
    private addInstruction;
    getInstructions(programId: string): ClassifiedInstruction[];
    getMultiInstructions(programIds: string[]): ClassifiedInstruction[];
    getInstructionByDescriminator(descriminator: Buffer, slice: number): ClassifiedInstruction | null;
    getAllProgramIds(): string[];
}
