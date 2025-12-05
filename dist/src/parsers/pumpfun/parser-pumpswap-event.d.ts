import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, PumpswapEvent } from '../../types';
export declare class PumpswapEventParser {
    private readonly adapter;
    constructor(adapter: TransactionAdapter);
    processEvents(): PumpswapEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): PumpswapEvent[];
    private convertBuyEvent;
    private convertSellEvent;
    private convertCreatePoolEvent;
    private convertDepositEvent;
    private convertWithdrawEvent;
}
