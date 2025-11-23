"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoopfunEventParser = void 0;
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const binary_reader_1 = require("../binary-reader");
/**
 * Parse Boopfun events (CREATE/BUY/SELL/COMPLETE)
 */
class BoopfunEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.eventParsers = {
            BUY: {
                discriminators: [constants_1.DISCRIMINATORS.BOOPFUN.BUY],
                slice: 8,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminators: [constants_1.DISCRIMINATORS.BOOPFUN.SELL],
                slice: 8,
                decode: this.decodeSellEvent.bind(this),
            },
            CREATE: {
                discriminators: [constants_1.DISCRIMINATORS.BOOPFUN.CREATE],
                slice: 8,
                decode: this.decodeCreateEvent.bind(this),
            },
            COMPLETE: {
                discriminators: [constants_1.DISCRIMINATORS.BOOPFUN.COMPLETE],
                slice: 8,
                decode: this.decodeCompleteEvent.bind(this),
            },
        };
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.BOOP_FUN.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                for (const [type, parser] of Object.entries(this.eventParsers)) {
                    const discriminator = Buffer.from(data.slice(0, parser.slice));
                    if (parser.discriminators.some((it) => discriminator.equals(it))) {
                        const options = {
                            instruction,
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
                console.error('Failed to parse Boopfun event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeBuyEvent(data, options) {
        const { instruction, outerIndex, innerIndex } = options;
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const reader = new binary_reader_1.BinaryReader(data);
        const transfers = this.getTransfersForInstruction(this.adapter.getInstructionProgramId(instruction), outerIndex, innerIndex);
        const transfer = transfers.find((transfer) => transfer.info.mint == accounts[0]);
        const evt = {
            mint: accounts[0],
            quoteMint: constants_1.TOKENS.SOL,
            solAmount: reader.readU64(),
            tokenAmount: BigInt(transfer?.info.tokenAmount.amount || '0'),
            isBuy: true,
            user: accounts[6],
            bondingCurve: accounts[1],
        };
        const inputMint = evt.quoteMint;
        const inputAmount = evt.solAmount;
        const inputDecimals = 9;
        const outputMint = evt.mint;
        const outputAmount = evt.tokenAmount;
        const outputDecimals = 6;
        return {
            protocol: constants_1.DEX_PROGRAMS.BOOP_FUN.name,
            type: 'BUY',
            bondingCurve: evt.bondingCurve,
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
        };
    }
    decodeSellEvent(data, options) {
        const { instruction, outerIndex, innerIndex } = options;
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const reader = new binary_reader_1.BinaryReader(data);
        const transfers = this.getTransfersForInstruction(this.adapter.getInstructionProgramId(instruction), outerIndex, innerIndex);
        const transfer = transfers.find((transfer) => transfer.info.mint == constants_1.TOKENS.SOL);
        const evt = {
            mint: accounts[0],
            quoteMint: constants_1.TOKENS.SOL,
            solAmount: BigInt(transfer?.info.tokenAmount.amount || '0'),
            tokenAmount: reader.readU64(),
            isBuy: false,
            user: accounts[6],
            bondingCurve: accounts[1],
        };
        const inputMint = evt.mint;
        const inputAmount = evt.tokenAmount;
        const inputDecimals = 6;
        const outputMint = evt.quoteMint;
        const outputAmount = evt.solAmount;
        const outputDecimals = 9;
        return {
            protocol: constants_1.DEX_PROGRAMS.BOOP_FUN.name,
            type: 'SELL',
            bondingCurve: evt.bondingCurve,
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
        };
    }
    decodeCreateEvent(data, options) {
        const { instruction } = options;
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const reader = new binary_reader_1.BinaryReader(data);
        reader.readU64(); // skip
        const evt = {
            name: reader.readString(),
            symbol: reader.readString(),
            uri: reader.readString(),
            mint: accounts[2],
            user: accounts[3],
        };
        const classifier = new instruction_classifier_1.InstructionClassifier(this.adapter);
        const deployInst = classifier.getInstructionByDescriminator(Buffer.from(constants_1.DISCRIMINATORS.BOOPFUN.DEPLOY), 8);
        const deployAccounts = this.adapter.getInstructionAccounts(deployInst?.instruction);
        const bondingCurve = deployAccounts[2];
        const platformConfig = deployAccounts[5];
        return {
            protocol: constants_1.DEX_PROGRAMS.BOOP_FUN.name,
            type: 'CREATE',
            timestamp: this.adapter.blockTime,
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            name: evt.name,
            symbol: evt.symbol,
            uri: evt.uri,
            bondingCurve: bondingCurve,
            creator: evt.user,
            platformConfig: platformConfig
        };
    }
    decodeCompleteEvent(data, options) {
        const { instruction, outerIndex, innerIndex } = options;
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const transfers = this.getTransfersForInstruction(this.adapter.getInstructionProgramId(instruction), outerIndex, innerIndex);
        const sols = transfers
            .filter((transfer) => transfer.info.mint == constants_1.TOKENS.SOL)
            .sort((a, b) => b.info.tokenAmount.uiAmount - a.info.tokenAmount.uiAmount);
        const evt = {
            user: accounts[10],
            mint: accounts[0],
            bondingCurve: accounts[7],
            solAmount: BigInt(sols[0].info.tokenAmount.amount),
            feeAmount: sols.length > 1 ? BigInt(sols[1].info.tokenAmount.amount) : BigInt(0),
        };
        return {
            protocol: constants_1.DEX_PROGRAMS.BOOP_FUN.name,
            type: 'COMPLETE',
            timestamp: this.adapter.blockTime,
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            bondingCurve: evt.bondingCurve,
        };
    }
    getTransfersForInstruction(programId, outerIndex, innerIndex) {
        const key = `${programId}:${outerIndex}${innerIndex == undefined ? '' : `-${innerIndex}`}`;
        const transfers = this.transferActions[key] || [];
        return transfers.filter((t) => ['transfer', 'transferChecked'].includes(t.type));
    }
}
exports.BoopfunEventParser = BoopfunEventParser;
//# sourceMappingURL=parser-boopfun-event.js.map