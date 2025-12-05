import { ClassifiedInstruction, TransferData } from '../../types';
import { MemeEvent } from '../../types/meme';
import { BaseEventParser } from '../base-event-parser';
import { TransactionAdapter } from '../../transaction-adapter';
import { TransactionUtils } from '../../transaction-utils';
export declare class MeteoraDBCEventParser extends BaseEventParser {
    protected adapter: TransactionAdapter;
    protected transferActions: Record<string, TransferData[]>;
    protected utils: TransactionUtils;
    constructor(adapter: TransactionAdapter, transferActions: Record<string, TransferData[]>);
    private getInstructionDiscriminators;
    private readonly eventParsers;
    private initializeDiscriminators;
    processEvents(): MemeEvent[];
    /**
     * Scan all inner instructions for EvtCreateConfig/EvtCreateConfigV2 events and cache them
     * This is called before processing events to ensure config data is available
     *
     * Uses brute force discriminator search to handle cases where the event
     * may not have the standard Anchor self-CPI prefix
     */
    private cacheConfigsFromTransaction;
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeTradeEvent;
    /**
     * Extract full swap data from EvtSwap/EvtSwap2 CPI event in inner instructions
     * Uses the IDL decoder to identify and extract fees and reserves from swap events
     */
    private extractSwapDataFromEvent;
    private decodeCreateEvent;
    /**
     * Extract config data from create_config instruction or EvtCreateConfig CPI event
     * ConfigParameters includes sqrt_start_price (u128) and migration_quote_threshold (u64)
     * Returns both values or undefined if not found
     */
    private extractConfigData;
    /**
     * Extract config data (sqrt_start_price and migration_quote_threshold) from EvtCreateConfig/V2 CPI event
     * The event is emitted when create_config is called and contains both values
     *
     * Uses brute force discriminator search to handle cases where the event
     * may not have the standard Anchor self-CPI prefix
     */
    private extractConfigDataFromCreateConfigEvent;
    /**
     * Parse sqrt_start_price from ConfigParameters data
     * Returns the value as bigint or undefined if parsing fails
     */
    private parseSqrtStartPriceFromConfigData;
    private decodeDBCMigrateDammEvent;
    private decodeDBCMigrateDammV2Event;
    /**
     * Resolve real creator when launchpad signs on behalf of user.
     *
     * Different launchpads have different patterns:
     *
     * BAGS: The real user is signer[2]. BAGS signs on behalf of user.
     *   Pattern: [BAGS_fee_claimer, mint, real_user]
     *   Detection: accounts[2] = BAGS_fee_claimer -> use signer[2]
     *
     * Believe: The fee claimer IS the creator (GMGN standard).
     *   Pattern: [Believe_fee_claimer, mint, ?]
     *   Detection: accounts[2] = system_account -> use signer[0] (fee claimer)
     *
     * Others: Use instruction accounts[2] as-is
     */
    private resolveRealCreator;
    /**
     * Resolve launchpad platform name from transaction.
     *
     * Strategy 1: Check signers - Believe, Moonshot, BAGS, JupiterStudio, Candle
     * have their feeClaimer wallet as a required SIGNER.
     *
     * Strategy 2: Check caller program - DaosFun invokes Meteora DBC via CPI.
     * If this is an inner instruction, check if the outer program is a known launchpad.
     */
    private resolveLaunchpadPlatform;
}
