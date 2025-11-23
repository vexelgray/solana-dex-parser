import { PoolEvent, PoolEventType, TransferData } from '../../types';
import { BaseLiquidityParser } from '../base-liquidity-parser';
export declare abstract class MeteoraLiquidityParserBase extends BaseLiquidityParser {
    abstract getPoolAction(data: Buffer): PoolEventType | {
        name: string;
        type: PoolEventType;
    } | null;
    processLiquidity(): PoolEvent[];
    protected parseInstruction(instruction: any, programId: string, outerIndex: number, innerIndex?: number): PoolEvent | null;
    protected abstract parseAddLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
    protected abstract parseRemoveLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
    protected parseCreateLiquidityEvent?(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
}
