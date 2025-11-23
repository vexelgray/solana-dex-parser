import { TradeInfo } from '../../types';
import { BaseParser } from '../base-parser';
export declare class MoonitParser extends BaseParser {
    processTrades(): TradeInfo[];
    private isTradeInstruction;
    private parseTradeInstruction;
    private detectCollateralMint;
    private calculateAmounts;
    private getTokenBalanceChanges;
    private createTokenAmount;
}
