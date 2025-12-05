import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, MemeEvent, TransferData } from '../../types';
export declare class RaydiumLaunchpadEventParser {
    private readonly adapter;
    private readonly transferActions;
    private migrateToAmmDisc;
    private migrateToCpswapDisc;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    private getDiscriminators;
    private getEventDiscriminator;
    private readonly EventsParsers;
    private initializeDiscriminators;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeTradeInstruction;
    private decodeCreateEvent;
    private decodeCompleteInstruction;
}
