"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraDBCEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const utils_1 = require("../../utils");
const base_event_parser_1 = require("../base-event-parser");
const binary_reader_1 = require("../binary-reader");
const web3_js_1 = require("@solana/web3.js");
const transaction_utils_1 = require("../../transaction-utils");
class MeteoraDBCEventParser extends base_event_parser_1.BaseEventParser {
    constructor(adapter, transferActions) {
        super(adapter, transferActions);
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.eventParsers = {
            TRADE: {
                discriminators: [constants_1.DISCRIMINATORS.METEORA_DBC.SWAP, constants_1.DISCRIMINATORS.METEORA_DBC.SWAP_V2],
                slice: 8,
                decode: this.decodeTradeEvent.bind(this),
            },
            CREATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.METEORA_DBC.INITIALIZE_VIRTUAL_POOL_WITH_SPL_TOKEN,
                    constants_1.DISCRIMINATORS.METEORA_DBC.INITIALIZE_VIRTUAL_POOL_WITH_TOKEN2022,
                ],
                slice: 8,
                decode: this.decodeCreateEvent.bind(this),
            },
            MICRATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.METEORA_DBC.METEORA_DBC_MIGRATE_DAMM,
                ],
                slice: 8,
                decode: this.decodeDBCMigrateDammEvent.bind(this),
            },
            MICRATE_V2: {
                discriminators: [
                    constants_1.DISCRIMINATORS.METEORA_DBC.METEORA_DBC_MIGRATE_DAMM_V2,
                ],
                slice: 8,
                decode: this.decodeDBCMigrateDammV2Event.bind(this),
            },
        };
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.METEORA_DBC.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ programId, instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                for (const [_, parser] of Object.entries(this.eventParsers)) {
                    const discriminator = buffer_1.Buffer.from(data.slice(0, parser.slice));
                    if (parser.discriminators.some((it) => discriminator.equals(it))) {
                        const options = {
                            instruction,
                            programId,
                            outerIndex,
                            innerIndex,
                            signer: this.adapter.signer,
                        };
                        const memeEvent = parser.decode(data.slice(parser.slice), options);
                        if (!memeEvent)
                            return null;
                        memeEvent.protocol = constants_1.DEX_PROGRAMS.METEORA_DBC.name;
                        memeEvent.signature = this.adapter.signature;
                        memeEvent.slot = this.adapter.slot;
                        memeEvent.timestamp = this.adapter.blockTime;
                        memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                        return memeEvent;
                    }
                }
            }
            catch (error) {
                console.error('Failed to parse Meteora DBC event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeTradeEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const inputAmount = reader.readU64();
        const outputAmount = reader.readU64();
        const userAccount = accounts[9];
        const baseMint = accounts[7];
        const quoteMint = accounts[8];
        const inputTokenAccount = accounts[3];
        const outputTokenAccount = accounts[4];
        var inputMint, outputMint;
        var tradeType = (0, utils_1.GetAccountTradeType)(new web3_js_1.PublicKey(options.signer), new web3_js_1.PublicKey(baseMint), new web3_js_1.PublicKey(inputTokenAccount), new web3_js_1.PublicKey(outputTokenAccount));
        if (tradeType == 'SELL') {
            inputMint = baseMint;
            outputMint = quoteMint;
        }
        else {
            inputMint = quoteMint;
            outputMint = baseMint;
        }
        const event = {
            type: tradeType,
            baseMint: baseMint, // base_mint
            quoteMint: quoteMint, // quote_mint
            bondingCurve: accounts[2], // pool
            pool: accounts[2], // pool
            user: userAccount,
            inputToken: {
                mint: inputMint,
                amountRaw: inputAmount.toString(),
            },
            outputToken: {
                mint: outputMint,
                amountRaw: outputAmount.toString(),
            },
        };
        const transfers = this.getTransfersForInstruction(options.programId, options.outerIndex, options.innerIndex);
        if (transfers.length >= 2) {
            const trade = this.utils.processSwapData(transfers.slice(0, 2), {});
            if (trade) {
                event.inputToken = trade.inputToken;
                event.outputToken = trade.outputToken;
            }
        }
        // Extract fees from EvtSwap/EvtSwap2 CPI event
        const feeData = this.extractFeesFromSwapEvent(options.outerIndex);
        if (feeData) {
            // Fee is in quote token (SOL) for Meteora DBC
            const feeDecimals = this.adapter.getTokenDecimals(quoteMint);
            event.fee = Number(feeData.tradingFee + feeData.protocolFee + feeData.referralFee);
            event.feeRaw = (feeData.tradingFee + feeData.protocolFee + feeData.referralFee).toString();
            event.feeMint = quoteMint;
            event.feeDecimals = feeDecimals;
        }
        return event;
    }
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
    extractFeesFromSwapEvent(outerIndex) {
        try {
            const innerGroup = this.adapter.innerInstructions?.find((it) => it.index === outerIndex);
            if (!innerGroup?.instructions?.length)
                return null;
            for (const inner of innerGroup.instructions) {
                try {
                    const data = (0, utils_1.getInstructionData)(inner);
                    if (data.length < 100)
                        continue; // Minimum size for swap events
                    const discriminator = buffer_1.Buffer.from(data.slice(0, 16));
                    // Check for EvtSwap2 (newer version)
                    if (discriminator.equals(buffer_1.Buffer.from(constants_1.DISCRIMINATORS.METEORA_DBC.EVT_SWAP2))) {
                        // Offset to SwapResult2: 16 (disc) + 32 (pool) + 32 (config) + 1 (direction) + 1 (has_referral) + 17 (SwapParameters2) = 99
                        // Then skip to fees: 8 + 8 + 8 + 8 + 16 = 48 bytes into SwapResult2
                        const feeOffset = 16 + 32 + 32 + 1 + 1 + 17 + 8 + 8 + 8 + 8 + 16; // = 147
                        if (data.length >= feeOffset + 24) {
                            const feeReader = new binary_reader_1.BinaryReader(buffer_1.Buffer.from(data.slice(feeOffset)));
                            return {
                                tradingFee: feeReader.readU64(),
                                protocolFee: feeReader.readU64(),
                                referralFee: feeReader.readU64(),
                            };
                        }
                    }
                    // Check for EvtSwap (older version)
                    if (discriminator.equals(buffer_1.Buffer.from(constants_1.DISCRIMINATORS.METEORA_DBC.EVT_SWAP))) {
                        // Offset to SwapResult: 16 (disc) + 32 (pool) + 32 (config) + 1 (direction) + 1 (has_referral) + 16 (SwapParameters) = 98
                        // Then skip to fees: 8 + 8 + 16 = 32 bytes into SwapResult
                        const feeOffset = 16 + 32 + 32 + 1 + 1 + 16 + 8 + 8 + 16; // = 130
                        if (data.length >= feeOffset + 24) {
                            const feeReader = new binary_reader_1.BinaryReader(buffer_1.Buffer.from(data.slice(feeOffset)));
                            return {
                                tradingFee: feeReader.readU64(),
                                protocolFee: feeReader.readU64(),
                                referralFee: feeReader.readU64(),
                            };
                        }
                    }
                }
                catch {
                    continue;
                }
            }
        }
        catch {
            // Silently ignore fee extraction errors
        }
        return null;
    }
    decodeCreateEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        // Validate minimum account count
        if (accounts.length < 10) {
            throw Error("insufficient accounts for init_pool_spl instruction: need at least 16");
        }
        const name = reader.readString();
        const symbol = reader.readString();
        const uri = reader.readString();
        return {
            type: 'CREATE',
            name: name,
            symbol: symbol,
            uri: uri,
            user: accounts[2],
            baseMint: accounts[3],
            quoteMint: accounts[4],
            pool: accounts[5],
            bondingCurve: accounts[5],
            platformConfig: accounts[0],
        };
    }
    decodeDBCMigrateDammEvent(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        return {
            type: 'MIGRATE',
            baseMint: accounts[7],
            quoteMint: accounts[8],
            platformConfig: accounts[2],
            bondingCurve: accounts[0],
            pool: accounts[4],
            poolDex: constants_1.DEX_PROGRAMS.METEORA_DAMM.name
        };
    }
    decodeDBCMigrateDammV2Event(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        return {
            type: 'MIGRATE',
            baseMint: accounts[13],
            quoteMint: accounts[14],
            platformConfig: accounts[2],
            bondingCurve: accounts[0],
            pool: accounts[4],
            poolDex: constants_1.DEX_PROGRAMS.METEORA_DAMM_V2.name
        };
    }
}
exports.MeteoraDBCEventParser = MeteoraDBCEventParser;
//# sourceMappingURL=parser-meteora-dbc-event.js.map