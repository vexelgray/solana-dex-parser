import { PoolEvent, PoolEventType, TransferData } from '../../types';
import { MeteoraLiquidityParserBase } from './parser-meteora-liquidity-base';
export declare class MeteoraPoolsParser extends MeteoraLiquidityParserBase {
    getPoolAction(data: Buffer): PoolEventType | null;
    protected parseCreateLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
    protected parseAddLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
    protected parseRemoveLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
}
