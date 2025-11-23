import { PoolEventType } from '../../types';
import { RaydiumLiquidityParserBase, ParseEventConfig } from './parser-raydium-liquidity-base';
export declare class RaydiumCLPoolParser extends RaydiumLiquidityParserBase {
    getPoolAction(data: Buffer): {
        name: string;
        type: PoolEventType;
    } | null;
    getEventConfig(type: PoolEventType, instructionType: {
        name: string;
        type: PoolEventType;
    }): ParseEventConfig;
}
