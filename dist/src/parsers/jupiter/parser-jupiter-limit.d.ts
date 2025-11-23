import { TradeInfo, TransferData } from '../../types';
import { BaseParser } from '../base-parser';
export declare class JupiterLimitOrderParser extends BaseParser {
    processTrades(): TradeInfo[];
    processTransfers(): TransferData[];
    private parseInitializeOrder;
    private parseCancelOrder;
}
