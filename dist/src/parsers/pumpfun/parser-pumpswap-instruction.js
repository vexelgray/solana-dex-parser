"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpswapInstructionParser = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const binary_reader_1 = require("../binary-reader");
class PumpswapInstructionParser {
    constructor(adapter, classifier) {
        this.adapter = adapter;
        this.classifier = classifier;
        this.instructionParsers = {
            CREATE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.CREATE_POOL,
                decode: this.decodeCreateEvent.bind(this),
            },
            ADD: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.ADD_LIQUIDITY,
                decode: this.decodeAddLiquidity.bind(this),
            },
            REMOVE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.REMOVE_LIQUIDITY,
                decode: this.decodeRemoveLiquidity.bind(this),
            },
            BUY: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.BUY,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.SELL,
                decode: this.decodeSellEvent.bind(this),
            },
        };
    }
    processInstructions() {
        const instructions = this.classifier.getInstructions(constants_1.DEX_PROGRAMS.PUMP_SWAP.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = Buffer.from(data.slice(0, 8));
                for (const [type, parser] of Object.entries(this.instructionParsers)) {
                    if (discriminator.equals(parser.discriminator)) {
                        const eventData = parser.decode(instruction, { data: data.slice(8) });
                        if (!eventData)
                            return null;
                        const event = {
                            type: type,
                            data: eventData,
                            slot: this.adapter.slot,
                            timestamp: this.adapter.blockTime || 0,
                            signature: this.adapter.signature,
                            idx: `${outerIndex}-${innerIndex ?? 0}`,
                            signer: this.adapter.signers,
                        };
                        return event;
                    }
                }
            }
            catch (error) {
                console.error('Failed to parse Pumpswap instruction:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeBuyEvent(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            poolMint: accounts[0],
            user: accounts[1],
            baseMint: accounts[3],
            quoteMint: accounts[4],
            userBaseTokenAccount: accounts[5],
            userQuoteTokenAccount: accounts[6],
            poolBaseTokenAccount: accounts[7],
            poolQuoteTokenAccount: accounts[8],
            baseAmountOut: reader.readU64(),
            maxQuoteAmountIn: reader.readU64(),
        };
    }
    decodeSellEvent(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            poolMint: accounts[0],
            user: accounts[1],
            baseMint: accounts[3],
            quoteMint: accounts[4],
            userBaseTokenAccount: accounts[5],
            userQuoteTokenAccount: accounts[6],
            poolBaseTokenAccount: accounts[7],
            poolQuoteTokenAccount: accounts[8],
            baseAmountIn: reader.readU64(),
            minQuoteAmountOut: reader.readU64(),
        };
    }
    decodeAddLiquidity(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            poolMint: accounts[0],
            user: accounts[2],
            baseMint: accounts[3],
            quoteMint: accounts[4],
            lpMint: accounts[5],
            userBaseTokenAccount: accounts[6],
            userQuoteTokenAccount: accounts[7],
            userPoolTokenAccount: accounts[8],
            poolBaseTokenAccount: accounts[9],
            poolQuoteTokenAccount: accounts[10],
            lpTokenAmountOut: reader.readU64(),
            maxBaseAmountIn: reader.readU64(),
            maxQuoteAmountIn: reader.readU64(),
        };
    }
    decodeCreateEvent(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        reader.readU16();
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            poolMint: accounts[0],
            user: accounts[2],
            baseMint: accounts[3],
            quoteMint: accounts[4],
            lpMint: accounts[5],
            userBaseTokenAccount: accounts[6],
            userQuoteTokenAccount: accounts[7],
            userPoolTokenAccount: accounts[8],
            poolBaseTokenAccount: accounts[9],
            poolQuoteTokenAccount: accounts[10],
            baseAmountIn: reader.readU64(),
            quoteAmountOut: reader.readU64(),
        };
    }
    decodeRemoveLiquidity(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            poolMint: accounts[0],
            user: accounts[2],
            baseMint: accounts[3],
            quoteMint: accounts[4],
            lpMint: accounts[5],
            userBaseTokenAccount: accounts[6],
            userQuoteTokenAccount: accounts[7],
            userPoolTokenAccount: accounts[8],
            poolBaseTokenAccount: accounts[9],
            poolQuoteTokenAccount: accounts[10],
            lpTokenAmountIn: reader.readU64(),
            minBaseAmountOut: reader.readU64(),
            minQuoteAmountOut: reader.readU64(),
        };
    }
}
exports.PumpswapInstructionParser = PumpswapInstructionParser;
//# sourceMappingURL=parser-pumpswap-instruction.js.map