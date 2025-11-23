"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumLaunchpadEventParser = void 0;
const borsh_1 = require("borsh");
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const raydium_lcp_create_layout_1 = require("./layouts/raydium-lcp-create.layout");
const raydium_lcp_trade_layout_1 = require("./layouts/raydium-lcp-trade.layout");
const raydium_lcp_trade_v2_layout_1 = require("./layouts/raydium-lcp-trade_v2.layout");
class RaydiumLaunchpadEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.EventsParsers = {
            CREATE: {
                discriminators: [constants_1.DISCRIMINATORS.RAYDIUM_LCP.CREATE_EVENT],
                slice: 16,
                decode: this.decodeCreateEvent.bind(this),
            },
            TRADE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.RAYDIUM_LCP.BUY_EXACT_IN,
                    constants_1.DISCRIMINATORS.RAYDIUM_LCP.BUY_EXACT_OUT,
                    constants_1.DISCRIMINATORS.RAYDIUM_LCP.SELL_EXACT_IN,
                    constants_1.DISCRIMINATORS.RAYDIUM_LCP.SELL_EXACT_OUT,
                ],
                slice: 8,
                decode: this.decodeTradeInstruction.bind(this),
            },
            COMPLETE: {
                discriminators: [constants_1.DISCRIMINATORS.RAYDIUM_LCP.MIGRATE_TO_AMM, constants_1.DISCRIMINATORS.RAYDIUM_LCP.MIGRATE_TO_CPSWAP],
                slice: 8,
                decode: this.decodeCompleteInstruction.bind(this),
            },
        };
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.RAYDIUM_LCP.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                for (const [type, parser] of Object.entries(this.EventsParsers)) {
                    const discriminator = buffer_1.Buffer.from(data.slice(0, parser.slice));
                    if (parser.discriminators.some((it) => discriminator.equals(it))) {
                        const options = {
                            instruction,
                            outerIndex,
                            innerIndex,
                        };
                        const memeEvent = parser.decode(data, options);
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
                console.error('Failed to parse RaydiumLCP event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeTradeInstruction(data, options) {
        const eventInstruction = this.adapter.getInnerInstruction(options.outerIndex, options.innerIndex == undefined ? 0 : options.innerIndex + 1); // find inner instruction
        if (!eventInstruction) {
            throw new Error('Event instruction not found');
        }
        // get event data from inner instruction
        const eventData = (0, utils_1.getInstructionData)(eventInstruction).slice(16);
        const isNewVersion = eventData.length > 130; // 146
        const layout = isNewVersion
            ? (0, borsh_1.deserializeUnchecked)(raydium_lcp_trade_v2_layout_1.RaydiumLCPTradeV2Layout.schema, raydium_lcp_trade_v2_layout_1.RaydiumLCPTradeV2Layout, buffer_1.Buffer.from(eventData))
            : (0, borsh_1.deserializeUnchecked)(raydium_lcp_trade_layout_1.RaydiumLCPTradeLayout.schema, raydium_lcp_trade_layout_1.RaydiumLCPTradeLayout, buffer_1.Buffer.from(eventData));
        const evt = layout.toObject();
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        evt.user = accounts[0];
        evt.baseMint = accounts[9];
        evt.quoteMint = accounts[10];
        let inputMint, outputMint;
        let inputAmount, outputAmount;
        let inputDecimals, outputDecimals;
        if (evt.tradeDirection == 0) {
            inputMint = evt.quoteMint;
            inputAmount = evt.amountIn;
            inputDecimals = 9;
            outputMint = evt.baseMint;
            outputAmount = evt.amountOut;
            outputDecimals = 6;
        }
        else {
            inputMint = evt.baseMint;
            inputAmount = evt.amountIn;
            inputDecimals = 6;
            outputMint = evt.quoteMint;
            outputAmount = evt.amountOut;
            outputDecimals = 9;
        }
        return {
            protocol: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            type: evt.tradeDirection === 0 ? 'BUY' : 'SELL',
            bondingCurve: evt.poolState,
            baseMint: evt.baseMint,
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
            fee: Number(evt.protocolFee),
            platformFee: Number(evt.platformFee),
            shareFee: Number(evt.shareFee),
            creatorFee: evt.creatorFee,
        };
    }
    decodeCreateEvent(data, options) {
        const eventInstruction = this.adapter.instructions[options.outerIndex]; // find outer instruction
        if (!eventInstruction) {
            throw new Error('Event instruction not found');
        }
        // parse event data
        const eventData = data.slice(16);
        const evt = raydium_lcp_create_layout_1.PoolCreateEventLayout.deserialize(eventData).toObject();
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(eventInstruction);
        evt.baseMint = accounts[6];
        evt.quoteMint = accounts[7];
        return {
            protocol: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            type: 'CREATE',
            timestamp: this.adapter.blockTime,
            user: evt.creator,
            baseMint: evt.baseMint,
            quoteMint: evt.quoteMint,
            name: evt.baseMintParam.name,
            symbol: evt.baseMintParam.symbol,
            uri: evt.baseMintParam.uri,
            decimals: evt.baseMintParam.decimals,
            bondingCurve: evt.poolState,
            creator: evt.creator,
        };
    }
    decodeCompleteInstruction(data, options) {
        const discriminator = buffer_1.Buffer.from(data.slice(0, 8));
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const [baseMint, quoteMint, poolMint, lpMint] = discriminator.equals(constants_1.DISCRIMINATORS.RAYDIUM_LCP.MIGRATE_TO_AMM)
            ? [accounts[1], accounts[2], accounts[13], accounts[16]]
            : [accounts[1], accounts[2], accounts[5], accounts[7]];
        const amm = discriminator.equals(constants_1.DISCRIMINATORS.RAYDIUM_LCP.MIGRATE_TO_AMM)
            ? constants_1.DEX_PROGRAMS.RAYDIUM_V4.name
            : constants_1.DEX_PROGRAMS.RAYDIUM_CPMM.name;
        return {
            protocol: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            type: 'MIGRATE',
            timestamp: this.adapter.blockTime,
            baseMint: baseMint,
            quoteMint: quoteMint,
            pool: poolMint,
            poolDex: amm
        };
    }
}
exports.RaydiumLaunchpadEventParser = RaydiumLaunchpadEventParser;
//# sourceMappingURL=parser-raydium-launchpad-event.js.map