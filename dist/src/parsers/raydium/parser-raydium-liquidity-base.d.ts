import { PoolEvent, PoolEventType, TransferData } from '../../types';
import { BaseLiquidityParser } from '../base-liquidity-parser';
export interface ParseEventConfig {
    eventType: PoolEventType;
    poolIdIndex: number;
    lpMintIndex: number;
    tokenAmountOffsets?: {
        token0: number;
        token1: number;
        lp: number;
    };
}
export declare abstract class RaydiumLiquidityParserBase extends BaseLiquidityParser {
    abstract getPoolAction(data: Buffer): PoolEventType | {
        name: string;
        type: PoolEventType;
    } | null;
    abstract getEventConfig(type: PoolEventType, instructionType: PoolEventType | {
        name: string;
        type: PoolEventType;
    }): ParseEventConfig | null;
    processLiquidity(): PoolEvent[];
    ParseRaydiumInstruction(instruction: any, programId: string, outerIndex: number, innerIndex?: number): PoolEvent | null;
    protected parseEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[], config: ParseEventConfig): PoolEvent | null;
}
