"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShredParser = void 0;
const constants_1 = require("./constants");
const instruction_classifier_1 = require("./instruction-classifier");
const pumpfun_1 = require("./parsers/pumpfun");
const transaction_adapter_1 = require("./transaction-adapter");
const utils_1 = require("./utils");
/**
 * Main parser class for Solana Shred transactions
 */
class ShredParser {
    constructor() {
        // parser mapping
        this.parserMap = {
            [constants_1.DEX_PROGRAMS.PUMP_FUN.id]: pumpfun_1.PumpfunInstructionParser,
            [constants_1.DEX_PROGRAMS.PUMP_SWAP.id]: pumpfun_1.PumpswapInstructionParser,
        };
    }
    /**
     * Parse transaction with specific type
     */
    parseWithClassifier(tx, config = { tryUnknowDEX: true }) {
        const result = {
            state: true,
            signature: '',
            instructions: {},
        };
        try {
            const adapter = new transaction_adapter_1.TransactionAdapter(tx, config);
            const classifier = new instruction_classifier_1.InstructionClassifier(adapter);
            // Get DEX information and validate
            const allProgramIds = classifier.getAllProgramIds();
            result.signature = adapter.signature;
            if (config?.programIds && !config.programIds.some((id) => allProgramIds.includes(id))) {
                return result;
            }
            // Process instructions for each program
            for (const programId of allProgramIds) {
                if (config?.programIds && !config.programIds.some((id) => id == programId))
                    continue;
                if (config?.ignoreProgramIds && config.ignoreProgramIds.some((id) => id == programId))
                    continue;
                const ParserClass = this.parserMap[programId];
                if (ParserClass) {
                    const parser = new ParserClass(adapter, classifier);
                    result.instructions[(0, utils_1.getProgramName)(programId)] = parser.processInstructions();
                }
            }
        }
        catch (error) {
            if (config.throwError) {
                throw error;
            }
            const msg = `Parse error: ${tx?.transaction?.signatures?.[0]} ${error}`;
            result.state = false;
            result.msg = msg;
        }
        return result;
    }
    /**
     * Parse both trades and liquidity events from transaction
     */
    parseAll(tx, config) {
        return this.parseWithClassifier(tx, config);
    }
}
exports.ShredParser = ShredParser;
//# sourceMappingURL=shred-parser.js.map