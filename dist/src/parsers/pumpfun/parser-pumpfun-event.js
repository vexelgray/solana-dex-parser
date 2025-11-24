"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpfunEventParser = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const binary_reader_1 = require("../binary-reader");
// Pumpfun mayhem mode fee recipient
const MAYHEM_FEE_RECIPIENT = 'GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS';
class PumpfunEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.eventParsers = {
            TRADE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.TRADE_EVENT,
                decode: this.decodeTradeEvent.bind(this),
            },
            CREATE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.CREATE_EVENT,
                decode: this.decodeCreateEvent.bind(this),
            },
            COMPLETE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.COMPLETE_EVENT,
                decode: this.decodeCompleteEvent.bind(this),
            },
            MIGRATE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.MIGRATE_EVENT,
                decode: this.decodeMigrateEvent.bind(this),
            },
        };
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.PUMP_FUN.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = buffer_1.Buffer.from(data.slice(0, 16));
                for (const [type, parser] of Object.entries(this.eventParsers)) {
                    if (discriminator.equals(parser.discriminator)) {
                        const memeEvent = parser.decode(data.slice(16));
                        if (!memeEvent)
                            return null;
                        if (type == 'TRADE') {
                            const prevInstruction = (0, utils_1.getPrevInstructionByIndex)(instructions, outerIndex, innerIndex);
                            if (prevInstruction) {
                                const accounts = this.adapter.getInstructionAccounts(prevInstruction.instruction);
                                if (accounts && accounts.length > 3) {
                                    memeEvent.bondingCurve = accounts[3];
                                }
                            }
                        }
                        memeEvent.signature = this.adapter.signature;
                        memeEvent.slots = this.adapter.slot;
                        memeEvent.timestamp = this.adapter.blockTime;
                        memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                        return memeEvent;
                    }
                }
            }
            catch (error) {
                console.error('Failed to parse Pumpfun event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeTradeEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const evt = {
            mint: reader.readPubkey(),
            quoteMint: constants_1.TOKENS.SOL,
            solAmount: reader.readU64(),
            tokenAmount: reader.readU64(),
            isBuy: reader.readU8() === 1,
            user: bs58_1.default.encode(reader.readFixedArray(32)),
            timestamp: reader.readI64(),
            virtualSolReserves: reader.readU64(),
            virtualTokenReserves: reader.readU64(),
        };
        if (reader.remaining() >= 52) {
            evt.realSolReserves = reader.readU64();
            evt.realTokenReserves = reader.readU64();
            evt.feeRecipient = reader.readPubkey();
            evt.feeBasisPoints = reader.readU16();
            evt.fee = reader.readU64();
            evt.creator = reader.readPubkey();
            evt.creatorFeeBasisPoints = reader.readU16();
            evt.creatorFee = reader.readU64();
        }
        let inputMint, outputMint;
        let inputAmount, outputAmount;
        let inputDecimals, outputDecimals;
        if (evt.isBuy) {
            inputMint = evt.quoteMint;
            inputAmount = evt.solAmount;
            inputDecimals = 9;
            outputMint = evt.mint;
            outputAmount = evt.tokenAmount;
            outputDecimals = 6;
        }
        else {
            inputMint = evt.mint;
            inputAmount = evt.tokenAmount;
            inputDecimals = 6;
            outputMint = evt.quoteMint;
            outputAmount = evt.solAmount;
            outputDecimals = 9;
        }
        // Check if this is a mayhem mode trade
        const isMayhemMode = this.adapter.accountKeys.includes(MAYHEM_FEE_RECIPIENT);
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            type: evt.isBuy ? 'BUY' : 'SELL',
            baseMint: evt.mint,
            quoteMint: evt.quoteMint,
            user: evt.user,
            inputToken: {
                mint: inputMint,
                amountRaw: inputAmount.toString(),
                amount: (0, types_1.convertToUiAmount)(inputAmount, inputDecimals),
                decimals: inputDecimals,
            },
            outputToken: {
                mint: outputMint,
                amountRaw: outputAmount.toString(),
                amount: (0, types_1.convertToUiAmount)(outputAmount, outputDecimals),
                decimals: outputDecimals,
            },
            fee: evt.fee,
            creatorFee: evt.creatorFee,
            isMayhemMode,
            // Bonding curve reserves after trade
            virtualSolReserves: evt.virtualSolReserves ? Number(evt.virtualSolReserves) : undefined,
            virtualTokenReserves: evt.virtualTokenReserves ? Number(evt.virtualTokenReserves) : undefined,
            realSolReserves: evt.realSolReserves ? Number(evt.realSolReserves) : undefined,
            realTokenReserves: evt.realTokenReserves ? Number(evt.realTokenReserves) : undefined,
        };
    }
    decodeCreateEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const evt = {
            name: reader.readString(),
            symbol: reader.readString(),
            uri: reader.readString(),
            mint: bs58_1.default.encode(buffer_1.Buffer.from(reader.readFixedArray(32))),
            bondingCurve: bs58_1.default.encode(reader.readFixedArray(32)),
            user: bs58_1.default.encode(reader.readFixedArray(32)),
        };
        if (reader.remaining() >= 16) {
            evt.creator = reader.readPubkey();
            evt.timestamp = reader.readI64();
        }
        if (reader.remaining() >= 32) {
            evt.virtualTokenReserves = reader.readU64();
            evt.virtualSolReserves = reader.readU64();
            evt.realTokenReserves = reader.readU64();
            evt.tokenTotalSupply = reader.readU64();
        }
        // Read token_program and is_mayhem_mode from event data (IDL spec)
        if (reader.remaining() >= 33) {
            evt.tokenProgram = reader.readPubkey();
            evt.isMayhemMode = reader.readU8() === 1;
        }
        else {
            // Fallback to account key detection for older events
            evt.isMayhemMode = this.adapter.accountKeys.includes(MAYHEM_FEE_RECIPIENT);
        }
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            type: 'CREATE',
            timestamp: evt.timestamp,
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            name: evt.name,
            symbol: evt.symbol,
            uri: evt.uri,
            bondingCurve: evt.bondingCurve,
            creator: evt.creator,
            // Bonding curve data
            virtualTokenReserves: evt.virtualTokenReserves ? Number(evt.virtualTokenReserves) : undefined,
            virtualSolReserves: evt.virtualSolReserves ? Number(evt.virtualSolReserves) : undefined,
            realTokenReserves: evt.realTokenReserves ? Number(evt.realTokenReserves) : undefined,
            tokenTotalSupply: evt.tokenTotalSupply ? Number(evt.tokenTotalSupply) : undefined,
            tokenProgram: evt.tokenProgram,
            isMayhemMode: evt.isMayhemMode,
        };
    }
    decodeCompleteEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const evt = {
            user: bs58_1.default.encode(reader.readFixedArray(32)),
            mint: bs58_1.default.encode(buffer_1.Buffer.from(reader.readFixedArray(32))),
            bondingCurve: bs58_1.default.encode(reader.readFixedArray(32)),
            timestamp: reader.readI64(),
        };
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            type: 'COMPLETE',
            timestamp: evt.timestamp,
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            bondingCurve: evt.bondingCurve,
        };
    }
    decodeMigrateEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const evt = {
            user: bs58_1.default.encode(reader.readFixedArray(32)),
            mint: bs58_1.default.encode(buffer_1.Buffer.from(reader.readFixedArray(32))),
            mintAmount: reader.readU64(),
            solAmount: reader.readU64(),
            poolMigrateFee: reader.readU64(),
            bondingCurve: bs58_1.default.encode(reader.readFixedArray(32)),
            timestamp: reader.readI64(),
            pool: reader.readPubkey(),
        };
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            type: 'MIGRATE',
            timestamp: evt.timestamp,
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            bondingCurve: evt.bondingCurve,
            pool: evt.pool,
            poolDex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
            // Migration amounts
            migratedTokenAmount: evt.mintAmount ? Number(evt.mintAmount) : undefined,
            migratedSolAmount: evt.solAmount ? Number(evt.solAmount) : undefined,
            migrationFee: evt.poolMigrateFee ? Number(evt.poolMigrateFee) : undefined,
        };
    }
}
exports.PumpfunEventParser = PumpfunEventParser;
//# sourceMappingURL=parser-pumpfun-event.js.map