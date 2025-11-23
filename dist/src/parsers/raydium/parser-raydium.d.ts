import { TradeInfo } from '../../types';
import { BaseParser } from '../base-parser';
export declare class RaydiumParser extends BaseParser {
    processTrades(): TradeInfo[];
    private getPoolAddress;
    private notLiquidityEvent;
}
