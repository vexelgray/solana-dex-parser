import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, PoolEvent, TransferData } from '../../types';
import { BaseLiquidityParser } from '../base-liquidity-parser';
export declare class PumpswapLiquidityParser extends BaseLiquidityParser {
    private eventParser;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>, classifiedInstructions: ClassifiedInstruction[]);
    processLiquidity(): PoolEvent[];
    private parseLiquidityEvents;
    private parseCreateEvent;
    private parseDepositEvent;
    private parseWithdrawEvent;
}
