import { ClassifiedInstruction, TransferData } from '../../types';
import { MemeEvent } from '../../types/meme';
import { BaseEventParser } from '../base-event-parser';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
export declare class HeavenEventParser extends BaseEventParser {
    protected adapter: TransactionAdapter;
    protected transferActions: Record<string, TransferData[]>;
    protected utils: TransactionUtils;
    private configData;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    /**
     * Set config data from cache or RPC
     * Call this before processEvents() if you want to use actual on-chain values
     *
     * @param configAddress The Heaven ProtocolConfig account address
     */
    setConfigFromCache(configAddress: string): void;
    /**
     * Get the current config data (cached or defaults)
     */
    private getConfig;
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeInitialBuyEvent;
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeCreateEvent;
}
export { HeavenConfigCache } from './heaven-config-cache';
