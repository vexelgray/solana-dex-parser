"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeavenEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const utils_1 = require("../../utils");
const base_event_parser_1 = require("../base-event-parser");
const binary_reader_1 = require("../binary-reader");
const transaction_utils_1 = require("../../transaction-utils");
class HeavenEventParser extends base_event_parser_1.BaseEventParser {
    constructor(adapter, transferActions) {
        super(adapter, transferActions);
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.eventParsers = {
            BUY: {
                discriminators: [constants_1.DISCRIMINATORS.HEAVEN.BUY],
                slice: 8,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminators: [constants_1.DISCRIMINATORS.HEAVEN.SELL],
                slice: 8,
                decode: this.decodeSellEvent.bind(this),
            },
            INITIAL_BUY: {
                discriminators: [
                    constants_1.DISCRIMINATORS.HEAVEN.CREATE_POOL,
                ],
                slice: 8,
                decode: this.decodeInitialBuyEvent.bind(this),
            },
            CREATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.METAPLEX.CREATE_MINT,
                ],
                slice: 1,
                decode: this.decodeCreateEvent.bind(this),
            },
        };
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getMultiInstructions([constants_1.DEX_PROGRAMS.HEAVEN.id, constants_1.METAPLEX_PROGRAM_ID]);
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
    decodeInitialBuyEvent(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const bondingCurve = accounts[10];
        const userAccount = accounts[4];
        const inputMint = accounts[6]; //quoteMint
        const outputMint = accounts[5]; // baseMint
        const event = {
            protocol: constants_1.DEX_PROGRAMS.HEAVEN.name,
            type: 'BUY',
            baseMint: outputMint, // base_mint
            quoteMint: inputMint, // quote_mint
            bondingCurve: bondingCurve, // pool
            pool: bondingCurve, // pool
            user: userAccount,
            platformConfig: accounts[11]
        };
        return this.utils.processMemeTransferData(options, event, outputMint, false, 1, this.transferActions);
    }
    decodeBuyEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const inputAmount = reader.readU64();
        const outputAmount = reader.readU64();
        const bondingCurve = accounts[4];
        const userAccount = accounts[5];
        const outputMint = accounts[6]; // baseMint
        const inputMint = accounts[7]; //quoteMint
        const event = {
            protocol: constants_1.DEX_PROGRAMS.HEAVEN.name,
            type: 'BUY',
            baseMint: outputMint, // base_mint
            quoteMint: inputMint, // quote_mint
            bondingCurve: bondingCurve, // pool
            pool: bondingCurve, // pool
            user: userAccount,
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
        return this.utils.processMemeTransferData(options, event, outputMint, true, 0, this.transferActions);
    }
    decodeSellEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const inputAmount = reader.readU64();
        const outputAmount = reader.readU64();
        const bondingCurve = accounts[4];
        const userAccount = accounts[5];
        const inputMint = accounts[6]; // baseMint 
        const outputMint = accounts[7]; // quoteMint
        const event = {
            protocol: constants_1.DEX_PROGRAMS.HEAVEN.name,
            type: 'SELL',
            baseMint: inputMint, // base_mint
            quoteMint: outputMint, // quote_mint
            bondingCurve: bondingCurve, // pool
            pool: bondingCurve, // pool
            user: userAccount,
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
        return this.utils.processMemeTransferData(options, event, inputMint, true, 0, this.transferActions);
    }
    decodeCreateEvent(data, options) {
        if (options.programId != constants_1.METAPLEX_PROGRAM_ID) {
            return null;
        }
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        reader.readU8(); // skip
        const name = reader.readString();
        const symbol = reader.readString();
        const uri = reader.readString();
        const baseMint = accounts[2];
        const user = accounts[4];
        return {
            protocol: constants_1.DEX_PROGRAMS.HEAVEN.name,
            type: 'CREATE',
            timestamp: this.adapter.blockTime,
            user: user,
            baseMint: baseMint,
            quoteMint: constants_1.TOKENS.SOL,
            name: name,
            symbol: symbol,
            uri: uri,
            decimals: 9,
            totalSupply: 1000000000
        };
    }
}
exports.HeavenEventParser = HeavenEventParser;
//# sourceMappingURL=parser-heaven-event.js.map