import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, PumpswapEvent } from '../../types';
export declare class PumpswapEventParser {
    private readonly adapter;
    constructor(adapter: TransactionAdapter);
    private readonly eventParsers;
    processEvents(): PumpswapEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): PumpswapEvent[];
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeAddLiquidity;
    private decodeCreateEvent;
    private decodeRemoveLiquidity;
}
