import { TransactionAdapter } from '../../transaction-adapter';
import { ClassifiedInstruction, MemeEvent, TransferData } from '../../types';
export declare class SugarEventParser {
    private readonly adapter;
    private readonly transferActions;
    private configData;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    /**
     * Set config data from cache or RPC
     * Call this before processEvents() if you want to use actual on-chain values
     *
     * @param stateAddress The Sugar State account address
     */
    setConfigFromCache(stateAddress: string): void;
    /**
     * Get the current config data (cached or defaults)
     */
    private getConfig;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    /**
     * Convert TradeEvent from IDL decoder to MemeEvent
     * IDL fields: mint, solAmount, tokenAmount, isBuy, user, timestamp,
     *             realSolReserves, virtualSolReserves, realTokenReserves, virtualTokenReserves
     */
    private convertTradeEvent;
    /**
     * Convert CreateEvent from IDL decoder to MemeEvent
     * IDL fields: name, symbol, uri, mint, bondingCurve, user, migrationKind
     *
     * Reserve values come from the State account config (cached or defaults)
     */
    private convertCreateEvent;
    /**
     * Convert CompleteEvent from IDL decoder to MemeEvent
     * IDL fields: user, mint, bondingCurve, timestamp
     */
    private convertCompleteEvent;
    /**
     * Convert MigrateEvent from IDL decoder to MemeEvent
     * IDL fields: tokenMint, poolAddress, vaultA, vaultB, timestamp
     */
    private convertMigrateEvent;
}
export { SugarConfigCache } from './sugar-config-cache';
