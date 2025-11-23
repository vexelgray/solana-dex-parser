import { TransactionAdapter } from '../transaction-adapter';
import { TransactionUtils } from '../transaction-utils';
import { ClassifiedInstruction, PoolEvent, TransferData } from '../types';
export declare abstract class BaseLiquidityParser {
    protected readonly adapter: TransactionAdapter;
    protected readonly transferActions: Record<string, TransferData[]>;
    protected readonly classifiedInstructions: ClassifiedInstruction[];
    protected readonly utils: TransactionUtils;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>, classifiedInstructions: ClassifiedInstruction[]);
    abstract processLiquidity(): PoolEvent[];
    protected getTransfersForInstruction(programId: string, outerIndex: number, innerIndex?: number, filterTypes?: string[]): TransferData[];
    protected getInstructionByDiscriminator(discriminator: Uint8Array, slice: number): ClassifiedInstruction | undefined;
}
