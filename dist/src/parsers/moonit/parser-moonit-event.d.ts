import { ClassifiedInstruction, TransferData } from '../../types';
import { MemeEvent } from '../../types/meme';
import { BaseEventParser } from '../base-event-parser';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
export declare class MoonitEventParser extends BaseEventParser {
    protected adapter: TransactionAdapter;
    protected transferActions: Record<string, TransferData[]>;
    protected utils: TransactionUtils;
    private curveData;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    /**
     * Set curve data from cache or RPC
     * Call this before processEvents() if you want to use actual on-chain values
     *
     * @param curveAddress The Moonit CurveAccount address
     */
    setCurveFromCache(curveAddress: string): void;
    /**
     * Get the current curve data (cached or defaults)
     */
    private getCurveDefaults;
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeBuyEvent;
    private decodeSellEvent;
    private decodeCreateEvent;
    private decodeMigrateEvent;
    private detectCollateralMint;
    private calculateAmounts;
    private getTokenBalanceChanges;
    private createTokenAmount;
}
export { MoonitConfigCache } from './moonit-config-cache';
