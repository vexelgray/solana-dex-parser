"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SugarEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const utils_1 = require("../../utils");
const base_event_parser_1 = require("../base-event-parser");
const binary_reader_1 = require("../binary-reader");
const transaction_utils_1 = require("../../transaction-utils");
class SugarEventParser extends base_event_parser_1.BaseEventParser {
    constructor(adapter, transferActions) {
        super(adapter, transferActions);
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.eventParsers = {
            BUY: {
                discriminators: [
                    constants_1.DISCRIMINATORS.SUGAR.BUY_EXACT_IN,
                    constants_1.DISCRIMINATORS.SUGAR.BUY_EXACT_OUT,
                    constants_1.DISCRIMINATORS.SUGAR.BUY_MAX_OUT,
                ],
                slice: 8,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminators: [
                    constants_1.DISCRIMINATORS.SUGAR.SELL_EXACT_IN,
                    constants_1.DISCRIMINATORS.SUGAR.SELL_EXACT_OUT,
                ],
                slice: 8,
                decode: this.decodeSellEvent.bind(this),
            },
            CREATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.SUGAR.CREATE,
                ],
                slice: 8,
                decode: this.decodeCreateEvent.bind(this),
            },
            MIGRATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.SUGAR.MIGRATE_TO_RADIUM,
                ],
                slice: 8,
                decode: this.decodeMigrateEvent.bind(this),
            },
        };
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getMultiInstructions([constants_1.DEX_PROGRAMS.SUGAR.id, constants_1.METAPLEX_PROGRAM_ID]);
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
                        };
                        const memeEvent = parser.decode(data.slice(parser.slice), options);
                        if (!memeEvent)
                            return null;
                        memeEvent.signature = this.adapter.signature;
                        memeEvent.slots = this.adapter.slot;
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
    decodeBuyEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        reader.readU16(); // skip
        const inputAmount = reader.readU64();
        const outputAmount = reader.readU64();
        const [baseMint, pool, user] = [accounts[1], accounts[2], accounts[6]];
        const inputMint = constants_1.TOKENS.SOL;
        const outputMint = baseMint;
        const event = {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'BUY',
            baseMint: outputMint, // base_mint
            quoteMint: inputMint, // quote_mint
            bondingCurve: pool, // pool
            pool: pool, // pool
            user: user,
            inputToken: {
                mint: inputMint,
                amountRaw: inputAmount.toString(),
            },
            outputToken: {
                mint: outputMint,
                amountRaw: outputAmount.toString(),
            },
            platformConfig: accounts[12]
        };
        return this.utils.processMemeTransferData(options, event, outputMint, false, 0, this.transferActions);
    }
    decodeSellEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        reader.readU16(); // skip
        const inputAmount = reader.readU64();
        const outputAmount = reader.readU64();
        const [baseMint, pool, user] = [accounts[1], accounts[2], accounts[6]];
        const inputMint = baseMint;
        const outputMint = constants_1.TOKENS.SOL;
        const event = {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'SELL',
            baseMint: inputMint, // base_mint
            quoteMint: outputMint, // quote_mint
            bondingCurve: pool, // pool
            pool: pool, // pool
            user: user,
            inputToken: {
                mint: inputMint,
                amountRaw: inputAmount.toString(),
            },
            outputToken: {
                mint: outputMint,
                amountRaw: outputAmount.toString(),
            },
            platformConfig: accounts[12]
        };
        return this.utils.processMemeTransferData(options, event, inputMint, false, 0, this.transferActions);
    }
    decodeCreateEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const name = reader.readString();
        const symbol = reader.readString();
        const uri = reader.readString();
        const [pool, baseMint, user] = [accounts[2], accounts[3], accounts[6]];
        return {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'CREATE',
            timestamp: this.adapter.blockTime,
            pool: pool,
            bondingCurve: pool,
            user: user,
            creator: user,
            baseMint: baseMint,
            quoteMint: constants_1.TOKENS.SOL,
            name: name,
            symbol: symbol,
            uri: uri,
            decimals: 6,
            totalSupply: 1000000000
        };
    }
    decodeMigrateEvent(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const [pool, bondingCurve, baseMint, user] = [accounts[15], accounts[3], accounts[1], accounts[12]];
        return {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'MIGRATE',
            timestamp: this.adapter.blockTime,
            pool: pool,
            bondingCurve: bondingCurve,
            user: user,
            creator: user,
            baseMint: baseMint,
            quoteMint: constants_1.TOKENS.SOL,
        };
    }
}
exports.SugarEventParser = SugarEventParser;
//# sourceMappingURL=parser-sugar-event.js.map