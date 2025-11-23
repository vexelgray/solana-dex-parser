import { ClassifiedInstruction, PoolEvent, TransferData } from '../../types';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
import { BaseLiquidityParser } from '../base-liquidity-parser';
export declare class RaydiumCLPoolV2Parser extends BaseLiquidityParser {
    protected adapter: TransactionAdapter;
    protected transferActions: Record<string, TransferData[]>;
    protected readonly classifiedInstructions: ClassifiedInstruction[];
    protected utils: TransactionUtils;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>, classifiedInstructions: ClassifiedInstruction[]);
    private readonly eventParsers;
    processLiquidity(): PoolEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): PoolEvent[];
    private decodeCreateEvent;
    private decodeAddEvent;
    private decodeRemoveEvent;
}
