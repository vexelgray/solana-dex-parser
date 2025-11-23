"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumCLPoolV2Parser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const utils_1 = require("../../utils");
const transaction_utils_1 = require("../../transaction-utils");
const liquidity_raydium_cl_1 = require("./liquidity-raydium-cl");
const base_liquidity_parser_1 = require("../base-liquidity-parser");
class RaydiumCLPoolV2Parser extends base_liquidity_parser_1.BaseLiquidityParser {
    constructor(adapter, transferActions, classifiedInstructions) {
        super(adapter, transferActions, classifiedInstructions);
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.classifiedInstructions = classifiedInstructions;
        this.eventParsers = {
            CREATE: {
                discriminators: Object.values(constants_1.DISCRIMINATORS.RAYDIUM_CL.CREATE),
                slice: 8,
                decode: this.decodeCreateEvent.bind(this),
            },
            ADD: {
                discriminators: Object.values(constants_1.DISCRIMINATORS.RAYDIUM_CL.ADD_LIQUIDITY),
                slice: 8,
                decode: this.decodeAddEvent.bind(this),
            },
            REMOVE: {
                discriminators: Object.values(constants_1.DISCRIMINATORS.RAYDIUM_CL.REMOVE_LIQUIDITY),
                slice: 8,
                decode: this.decodeRemoveEvent.bind(this),
            },
        };
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    processLiquidity() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.RAYDIUM_CL.id);
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
                        const poolEvent = parser.decode(data.slice(parser.slice), options);
                        if (!poolEvent)
                            return null;
                        poolEvent.programId = constants_1.DEX_PROGRAMS.RAYDIUM_CL.id;
                        poolEvent.amm = constants_1.DEX_PROGRAMS.RAYDIUM_CL.name;
                        poolEvent.signature = this.adapter.signature;
                        poolEvent.slots = this.adapter.slot;
                        poolEvent.timestamp = this.adapter.blockTime;
                        poolEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                        return poolEvent;
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
    decodeCreateEvent(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        // Validate minimum account count
        if (accounts.length < 10) {
            throw Error("insufficient accounts for init_pool_spl instruction: need at least 16");
        }
        let [token0, token1] = [accounts[3], accounts[4]]; // token0 is base token, token1 is quote token
        if ((0, utils_1.getTradeType)(token0, token1) == 'BUY') {
            [token0, token1] = [token1, token0];
        }
        return {
            user: accounts[0],
            type: 'CREATE',
            poolId: accounts[2],
            config: accounts[1],
            token0Mint: token0,
            token1Mint: token1,
        };
    }
    decodeAddEvent(data, options) {
        const parser = new liquidity_raydium_cl_1.RaydiumCLPoolParser(this.adapter, this.transferActions, []);
        return parser.ParseRaydiumInstruction(options.instruction, options.programId, options.outerIndex, options.innerIndex);
    }
    decodeRemoveEvent(data, options) {
        const parser = new liquidity_raydium_cl_1.RaydiumCLPoolParser(this.adapter, this.transferActions, []);
        return parser.ParseRaydiumInstruction(options.instruction, options.programId, options.outerIndex, options.innerIndex);
    }
}
exports.RaydiumCLPoolV2Parser = RaydiumCLPoolV2Parser;
//# sourceMappingURL=liquidity-raydium-cl_v2.js.map