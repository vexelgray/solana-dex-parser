import { PoolEventType } from '../../types';
import { RaydiumLiquidityParserBase, ParseEventConfig } from './parser-raydium-liquidity-base';
export declare class RaydiumV4PoolParser extends RaydiumLiquidityParserBase {
    getPoolAction(data: Buffer): PoolEventType | null;
    getEventConfig(type: PoolEventType): ParseEventConfig;
}
