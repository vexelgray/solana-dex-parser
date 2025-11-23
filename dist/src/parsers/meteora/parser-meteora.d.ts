import { TradeInfo } from '../../types';
import { BaseParser } from '../base-parser';
export declare class MeteoraParser extends BaseParser {
    processTrades(): TradeInfo[];
    private getPoolAddress;
    private notLiquidityEvent;
}
