import { TransactionAdapter } from '../../transaction-adapter';
import { MemeEvent, ClassifiedInstruction, TransferData } from '../../types';
/**
 * Parse Boopfun events (CREATE/BUY/SELL/COMPLETE)
 */
export declare class BoopfunEventParser {
    private readonly adapter;
    private readonly transferActions;
    private configData;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    /**
     * Set config data from cache or RPC
     * Call this before processEvents() if you want to use actual on-chain values
     *
     * @param configAddress The Boopfun Config account address
     */
    setConfigFromCache(configAddress: string): void;
    /**
     * Get the current config data (cached or defaults)
     */
    private getConfig;
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeCreateEvent;
    private decodeCompleteEvent;
    protected getTransfersForInstruction(programId: string, outerIndex: number, innerIndex?: number): TransferData[];
}
export { BoopfunConfigCache } from './boopfun-config-cache';
