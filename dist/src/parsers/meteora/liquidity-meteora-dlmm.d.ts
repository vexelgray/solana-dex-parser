import { PoolEvent, PoolEventType, TransferData } from '../../types';
import { MeteoraLiquidityParserBase } from './parser-meteora-liquidity-base';
export declare class MeteoraDLMMPoolParser extends MeteoraLiquidityParserBase {
    getPoolAction(data: Buffer): {
        name: string;
        type: PoolEventType;
    } | null;
    protected parseAddLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
    protected parseRemoveLiquidityEvent(instruction: any, index: number, data: Buffer, transfers: TransferData[]): PoolEvent;
    private normalizeTokens;
}
