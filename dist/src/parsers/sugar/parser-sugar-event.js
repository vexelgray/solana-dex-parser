"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SugarConfigCache = exports.SugarEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const decoders_1 = require("../../decoders");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const sugar_config_cache_1 = require("./sugar-config-cache");
// Sugar token constants
const SUGAR_DECIMALS = 6;
// SPL Token program (default for Sugar)
const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
class SugarEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.configData = null;
    }
    /**
     * Set config data from cache or RPC
     * Call this before processEvents() if you want to use actual on-chain values
     *
     * @param stateAddress The Sugar State account address
     */
    setConfigFromCache(stateAddress) {
        const cached = sugar_config_cache_1.SugarConfigCache.get(stateAddress);
        if (cached) {
            this.configData = cached;
        }
    }
    /**
     * Get the current config data (cached or defaults)
     */
    getConfig() {
        if (this.configData) {
            return this.configData;
        }
        return sugar_config_cache_1.SugarConfigCache.getDefaults();
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.SUGAR.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                const buffer = buffer_1.Buffer.from(data);
                // Use IDL decoder to identify and decode the event
                const decoded = decoders_1.sugarDecoder.decodeAnyEvent(buffer);
                if (!decoded)
                    return null;
                let memeEvent;
                switch (decoded.type) {
                    case 'TRADE':
                        memeEvent = this.convertTradeEvent(decoded.data);
                        break;
                    case 'CREATE':
                        memeEvent = this.convertCreateEvent(decoded.data);
                        break;
                    case 'COMPLETE':
                        memeEvent = this.convertCompleteEvent(decoded.data);
                        break;
                    case 'MIGRATE':
                        memeEvent = this.convertMigrateEvent(decoded.data);
                        break;
                    default:
                        return null;
                }
                // Add common fields
                memeEvent.signature = this.adapter.signature;
                memeEvent.slot = this.adapter.slot;
                memeEvent.timestamp = this.adapter.blockTime;
                memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                return memeEvent;
            }
            catch (error) {
                console.error('Failed to parse Sugar event:', error);
                throw error;
            }
        })
            .filter((event) => event !== null));
    }
    /**
     * Convert TradeEvent from IDL decoder to MemeEvent
     * IDL fields: mint, solAmount, tokenAmount, isBuy, user, timestamp,
     *             realSolReserves, virtualSolReserves, realTokenReserves, virtualTokenReserves
     */
    convertTradeEvent(evt) {
        let inputMint, outputMint;
        let inputAmount, outputAmount;
        let inputDecimals, outputDecimals;
        if (evt.isBuy) {
            inputMint = constants_1.TOKENS.SOL;
            inputAmount = evt.solAmount;
            inputDecimals = 9;
            outputMint = evt.mint;
            outputAmount = evt.tokenAmount;
            outputDecimals = SUGAR_DECIMALS;
        }
        else {
            inputMint = evt.mint;
            inputAmount = evt.tokenAmount;
            inputDecimals = SUGAR_DECIMALS;
            outputMint = constants_1.TOKENS.SOL;
            outputAmount = evt.solAmount;
            outputDecimals = 9;
        }
        return {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            launchpad: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: evt.isBuy ? 'BUY' : 'SELL',
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
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
            // Bonding curve reserves after trade (from IDL event)
            curveQuoteReserves: Number(evt.virtualSolReserves),
            curveBaseReserves: Number(evt.virtualTokenReserves),
            vaultQuoteReserves: Number(evt.realSolReserves),
            vaultBaseReserves: Number(evt.realTokenReserves),
        };
    }
    /**
     * Convert CreateEvent from IDL decoder to MemeEvent
     * IDL fields: name, symbol, uri, mint, bondingCurve, user, migrationKind
     *
     * Reserve values come from the State account config (cached or defaults)
     */
    convertCreateEvent(evt) {
        const config = this.getConfig();
        return {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            launchpad: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'CREATE',
            user: evt.user,
            // Grouped token structures for CREATE events
            baseToken: {
                mint: evt.mint,
                name: evt.name,
                symbol: evt.symbol,
                uri: evt.uri,
                decimals: SUGAR_DECIMALS,
                totalSupply: Number(config.totalSupply),
                programId: SPL_TOKEN_PROGRAM,
            },
            quoteToken: {
                mint: constants_1.TOKENS.SOL,
                symbol: 'SOL',
                decimals: 9,
            },
            creatorAddress: evt.user,
            poolAddress: evt.bondingCurve,
            configAddress: evt.bondingCurve, // Sugar uses bonding curve as config
            // Bonding curve reserves (from State account config)
            curveType: 'ConstantProduct',
            curveBaseReserves: Number(config.initialVirtualTokenReserve),
            curveQuoteReserves: Number(config.initialVirtualSolReserve),
            vaultBaseReserves: Number(config.totalSupply),
            vaultQuoteReserves: 0,
            // Goals
            initialSaleSupply: Number(config.totalSupply),
            graduationThreshold: Number(config.graduationThreshold),
        };
    }
    /**
     * Convert CompleteEvent from IDL decoder to MemeEvent
     * IDL fields: user, mint, bondingCurve, timestamp
     */
    convertCompleteEvent(evt) {
        return {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            launchpad: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'COMPLETE',
            timestamp: Number(evt.timestamp),
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            poolAddress: evt.bondingCurve,
        };
    }
    /**
     * Convert MigrateEvent from IDL decoder to MemeEvent
     * IDL fields: tokenMint, poolAddress, vaultA, vaultB, timestamp
     */
    convertMigrateEvent(evt) {
        return {
            protocol: constants_1.DEX_PROGRAMS.SUGAR.name,
            launchpad: constants_1.DEX_PROGRAMS.SUGAR.name,
            type: 'MIGRATE',
            timestamp: Number(evt.timestamp),
            baseMint: evt.tokenMint,
            quoteMint: constants_1.TOKENS.SOL,
            pool: evt.poolAddress,
            poolAddress: evt.poolAddress,
        };
    }
}
exports.SugarEventParser = SugarEventParser;
// Re-export config cache for external use
var sugar_config_cache_2 = require("./sugar-config-cache");
Object.defineProperty(exports, "SugarConfigCache", { enumerable: true, get: function () { return sugar_config_cache_2.SugarConfigCache; } });
//# sourceMappingURL=parser-sugar-event.js.map