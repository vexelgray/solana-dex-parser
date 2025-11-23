import { TradeInfo, TransferData } from '../../types';
import { BaseParser } from '../base-parser';
export declare class JupiterLimitOrderV2Parser extends BaseParser {
    processTrades(): TradeInfo[];
    private parseFlashFilled;
    private getAmm;
    processTransfers(): TransferData[];
    private parseInitializeOrder;
    private parseCancelOrder;
}
