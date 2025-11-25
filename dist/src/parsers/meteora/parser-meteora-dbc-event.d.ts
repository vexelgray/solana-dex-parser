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
    private readonly eventParsers;
    processEvents(): MemeEvent[];
    parseInstructions(instructions: ClassifiedInstruction[]): MemeEvent[];
    private decodeTradeEvent;
    /**
     * Extract fees from EvtSwap/EvtSwap2 CPI event in inner instructions
     *
     * EvtSwap structure (after 16-byte discriminator):
     * - pool: pubkey (32)
     * - config: pubkey (32)
     * - trade_direction: u8 (1)
     * - has_referral: bool (1)
     * - params: SwapParameters (16) = { amount_in: u64, minimum_amount_out: u64 }
     * - swap_result: SwapResult (48) = {
     *     actual_input_amount: u64 (8)
     *     output_amount: u64 (8)
     *     next_sqrt_price: u128 (16)
     *     trading_fee: u64 (8)
     *     protocol_fee: u64 (8)
     *     referral_fee: u64 (8)
     *   }
     *
     * EvtSwap2 structure (after 16-byte discriminator):
     * - pool: pubkey (32)
     * - config: pubkey (32)
     * - trade_direction: u8 (1)
     * - has_referral: bool (1)
     * - swap_parameters: SwapParameters2 (17) = { amount_0: u64, amount_1: u64, swap_mode: u8 }
     * - swap_result: SwapResult2 (64) = {
     *     included_fee_input_amount: u64 (8)
     *     excluded_fee_input_amount: u64 (8)
     *     amount_left: u64 (8)
     *     output_amount: u64 (8)
     *     next_sqrt_price: u128 (16)
     *     trading_fee: u64 (8)
     *     protocol_fee: u64 (8)
     *     referral_fee: u64 (8)
     *   }
     */
    private extractFeesFromSwapEvent;
    private decodeCreateEvent;
    private decodeDBCMigrateDammEvent;
    private decodeDBCMigrateDammV2Event;
}
