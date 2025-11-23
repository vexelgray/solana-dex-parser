import { TradeInfo, TransferData } from '../../types';
import { BaseParser } from '../base-parser';
export declare class JupiterVAParser extends BaseParser {
    processTrades(): TradeInfo[];
    private parseFullFilled;
    private getAmm;
    processTransfers(): TransferData[];
    private parseOpen;
    private parseWithdraw;
}
