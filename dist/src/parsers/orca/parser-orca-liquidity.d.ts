import { PoolEvent } from '../../types';
import { BaseLiquidityParser } from '../base-liquidity-parser';
export declare class OrcaLiquidityParser extends BaseLiquidityParser {
    processLiquidity(): PoolEvent[];
    private parseInstruction;
    private getPoolAction;
    private parseAddLiquidityEvent;
    private parseRemoveLiquidityEvent;
}
