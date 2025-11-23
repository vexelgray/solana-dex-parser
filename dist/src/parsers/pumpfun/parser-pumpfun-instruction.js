"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpfunInstructionParser = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const binary_reader_1 = require("../binary-reader");
class PumpfunInstructionParser {
    constructor(adapter, classifier) {
        this.adapter = adapter;
        this.classifier = classifier;
        this.instructionParsers = {
            CREATE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.CREATE,
                decode: this.decodeCreateEvent.bind(this),
            },
            MIGRATE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.MIGRATE,
                decode: this.decodeMigrateEvent.bind(this),
            },
            BUY: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.BUY,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminator: constants_1.DISCRIMINATORS.PUMPFUN.SELL,
                decode: this.decodeSellEvent.bind(this),
            },
        };
    }
    processInstructions() {
        const instructions = this.classifier.getInstructions(constants_1.DEX_PROGRAMS.PUMP_FUN.id);
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
                console.error('Failed to parse Pumpfun instruction:', this.adapter.signature, error);
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
            mint: accounts[2],
            bondingCurve: accounts[3],
            tokenAmount: reader.readU64(),
            solAmount: reader.readU64(),
            user: accounts[6],
        };
    }
    decodeSellEvent(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            mint: accounts[2],
            bondingCurve: accounts[3],
            tokenAmount: reader.readU64(),
            solAmount: reader.readU64(),
            user: accounts[6],
        };
    }
    decodeCreateEvent(instruction, options) {
        const { data } = options;
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            name: reader.readString(),
            symbol: reader.readString(),
            uri: reader.readString(),
            mint: accounts[0],
            bondingCurve: accounts[2],
            user: accounts[7],
        };
    }
    decodeMigrateEvent(instruction, _options) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            mint: accounts[2],
            bondingCurve: accounts[3],
            user: accounts[5],
            poolMint: accounts[9],
            quoteMint: accounts[4],
            lpMint: accounts[15],
            userPoolTokenAccount: accounts[16],
            poolBaseTokenAccount: accounts[17],
            poolQuoteTokenAccount: accounts[18],
        };
    }
}
exports.PumpfunInstructionParser = PumpfunInstructionParser;
//# sourceMappingURL=parser-pumpfun-instruction.js.map