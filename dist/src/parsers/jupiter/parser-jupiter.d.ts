import { TradeInfo } from '../../types';
import { BaseParser } from '../base-parser';
export declare class JupiterParser extends BaseParser {
    processTrades(): TradeInfo[];
    private isJupiterRouteEventInstruction;
    private parseJupiterRouteEventInstruction;
    private processSwapData;
    private buildIntermediateInfo;
    private removeIntermediateTokens;
    private convertToTradeInfo;
    private containsDCAProgram;
}
