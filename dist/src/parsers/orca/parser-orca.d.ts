import { TradeInfo } from '../../types';
import { BaseParser } from '../base-parser';
export declare class OrcaParser extends BaseParser {
    processTrades(): TradeInfo[];
    private notLiquidityEvent;
}
