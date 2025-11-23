import { TradeInfo, TransferData } from '../../types';
import { BaseParser } from '../base-parser';
export declare class JupiterDcaParser extends BaseParser {
    processTrades(): TradeInfo[];
    private parseFullFilled;
    private getAmm;
    processTransfers(): TransferData[];
    private parseCloseDca;
    private parseOpenDca;
}
