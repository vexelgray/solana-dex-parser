"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexParser = void 0;
const constants_1 = require("./constants");
const instruction_classifier_1 = require("./instruction-classifier");
const parsers_1 = require("./parsers");
const parser_boopfun_1 = require("./parsers/boopfun/parser-boopfun");
const parser_jupiter_dca_1 = require("./parsers/jupiter/parser-jupiter-dca");
const transaction_adapter_1 = require("./transaction-adapter");
const transaction_utils_1 = require("./transaction-utils");
const utils_1 = require("./utils");
/**
 * Main parser class for Solana DEX transactions
 */
class DexParser {
    constructor() {
        // Trade parser mapping
        this.parserMap = {
            [constants_1.DEX_PROGRAMS.JUPITER.id]: parsers_1.JupiterParser,
            [constants_1.DEX_PROGRAMS.JUPITER_DCA.id]: parser_jupiter_dca_1.JupiterDcaParser,
            [constants_1.DEX_PROGRAMS.JUPITER_VA.id]: parsers_1.JupiterVAParser,
            [constants_1.DEX_PROGRAMS.JUPITER_LIMIT_ORDER_V2.id]: parsers_1.JupiterLimitOrderV2Parser,
            [constants_1.DEX_PROGRAMS.MOONIT.id]: parsers_1.MoonitParser,
            [constants_1.DEX_PROGRAMS.METEORA.id]: parsers_1.MeteoraParser,
            [constants_1.DEX_PROGRAMS.METEORA_DAMM.id]: parsers_1.MeteoraParser,
            [constants_1.DEX_PROGRAMS.METEORA_DAMM_V2.id]: parsers_1.MeteoraParser,
            [constants_1.DEX_PROGRAMS.METEORA_DBC.id]: parsers_1.MeteoraDBCParser,
            [constants_1.DEX_PROGRAMS.PUMP_FUN.id]: parsers_1.PumpfunParser,
            [constants_1.DEX_PROGRAMS.PUMP_SWAP.id]: parsers_1.PumpswapParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_ROUTE.id]: parsers_1.RaydiumParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_CL.id]: parsers_1.RaydiumParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_CPMM.id]: parsers_1.RaydiumParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_V4.id]: parsers_1.RaydiumParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_AMM.id]: parsers_1.RaydiumParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_LCP.id]: parsers_1.RaydiumLaunchpadParser,
            [constants_1.DEX_PROGRAMS.ORCA.id]: parsers_1.OrcaParser,
            [constants_1.DEX_PROGRAMS.BOOP_FUN.id]: parser_boopfun_1.BoopfunParser,
        };
        // Liquidity parser mapping
        this.parseLiquidityMap = {
            [constants_1.DEX_PROGRAMS.METEORA.id]: parsers_1.MeteoraDLMMPoolParser,
            [constants_1.DEX_PROGRAMS.METEORA_DAMM.id]: parsers_1.MeteoraPoolsParser,
            [constants_1.DEX_PROGRAMS.METEORA_DAMM_V2.id]: parsers_1.MeteoraDAMMPoolParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_V4.id]: parsers_1.RaydiumV4PoolParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_CPMM.id]: parsers_1.RaydiumCPMMPoolParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_CL.id]: parsers_1.RaydiumCLPoolV2Parser,
            [constants_1.DEX_PROGRAMS.ORCA.id]: parsers_1.OrcaLiquidityParser,
            [constants_1.DEX_PROGRAMS.PUMP_FUN.id]: parsers_1.PumpswapLiquidityParser,
            [constants_1.DEX_PROGRAMS.PUMP_SWAP.id]: parsers_1.PumpswapLiquidityParser,
        };
        // Transfer parser mapping
        this.parseTransferMap = {
            [constants_1.DEX_PROGRAMS.JUPITER_DCA.id]: parser_jupiter_dca_1.JupiterDcaParser,
            [constants_1.DEX_PROGRAMS.JUPITER_VA.id]: parsers_1.JupiterVAParser,
            [constants_1.DEX_PROGRAMS.JUPITER_LIMIT_ORDER.id]: parsers_1.JupiterLimitOrderParser,
            [constants_1.DEX_PROGRAMS.JUPITER_LIMIT_ORDER_V2.id]: parsers_1.JupiterLimitOrderV2Parser,
        };
        // Meme parser mapping
        this.parseMemeEventMap = {
            [constants_1.DEX_PROGRAMS.PUMP_FUN.id]: parsers_1.PumpfunEventParser,
            [constants_1.DEX_PROGRAMS.METEORA_DBC.id]: parsers_1.MeteoraDBCEventParser,
            [constants_1.DEX_PROGRAMS.RAYDIUM_LCP.id]: parsers_1.RaydiumLaunchpadEventParser,
            [constants_1.DEX_PROGRAMS.BOOP_FUN.id]: parsers_1.BoopfunEventParser,
            [constants_1.DEX_PROGRAMS.MOONIT.id]: parsers_1.MoonitEventParser,
            [constants_1.DEX_PROGRAMS.HEAVEN.id]: parsers_1.HeavenEventParser,
            [constants_1.DEX_PROGRAMS.SUGAR.id]: parsers_1.SugarEventParser,
        };
    }
    /**
     * Parse transaction with specific type
     */
    parseWithClassifier(tx, config = { tryUnknowDEX: true, aggregateTrades: true }, parseType) {
        const result = {
            state: true,
            fee: { amount: '0', uiAmount: 0, decimals: 9 },
            trades: [],
            liquidities: [],
            transfers: [],
            memeEvents: [],
            slot: tx.slot,
            msg: '',
            timestamp: 0,
            signature: '',
            signer: [],
            computeUnits: 0,
            txStatus: 'unknown'
        };
        try {
            const adapter = new transaction_adapter_1.TransactionAdapter(tx, config);
            const utils = new transaction_utils_1.TransactionUtils(adapter);
            const classifier = new instruction_classifier_1.InstructionClassifier(adapter);
            // Get DEX information and validate
            const dexInfo = utils.getDexInfo(classifier);
            const allProgramIds = classifier.getAllProgramIds();
            result.timestamp = adapter.blockTime;
            result.signature = adapter.signature;
            result.signer = adapter.signers;
            result.computeUnits = adapter.computeUnits;
            result.txStatus = adapter.txStatus;
            if (config?.programIds && !config.programIds.some((id) => allProgramIds.includes(id))) {
                result.state = false;
                return result;
            }
            const transferActions = utils.getTransferActions(['mintTo', 'burn', 'mintToChecked', 'burnChecked']);
            // Process fee
            result.fee = adapter.fee;
            // Process user balance change
            result.solBalanceChange = adapter.getAccountSolBalanceChanges(false)?.get(adapter.signer);
            result.tokenBalanceChange = adapter.getAccountTokenBalanceChanges(true)?.get(adapter.signer);
            // Try specific parser first
            if (dexInfo.programId &&
                [
                    constants_1.DEX_PROGRAMS.JUPITER.id,
                    constants_1.DEX_PROGRAMS.JUPITER_DCA.id,
                    constants_1.DEX_PROGRAMS.JUPITER_DCA_KEEPER1.id,
                    constants_1.DEX_PROGRAMS.JUPITER_DCA_KEEPER2.id,
                    constants_1.DEX_PROGRAMS.JUPITER_DCA_KEEPER3.id,
                    constants_1.DEX_PROGRAMS.JUPITER_VA.id,
                    constants_1.DEX_PROGRAMS.JUPITER_LIMIT_ORDER_V2.id,
                ].includes(dexInfo.programId)) {
                if (parseType === 'trades' || parseType === 'all') {
                    const jupiterInstructions = classifier.getInstructions(dexInfo.programId);
                    const TradeParserClass = this.parserMap[dexInfo.programId];
                    if (TradeParserClass) {
                        const parser = new TradeParserClass(adapter, { ...dexInfo, programId: dexInfo.programId, amm: (0, utils_1.getProgramName)(dexInfo.programId) }, transferActions, jupiterInstructions);
                        const trades = parser.processTrades();
                        if (trades.length > 0) {
                            if (config.aggregateTrades == true) {
                                result.aggregateTrade = utils.attachTradeFee((0, utils_1.getFinalSwap)(trades));
                            }
                            else {
                                result.trades.push(...trades);
                            }
                        }
                    }
                }
                if (result.trades.length > 0) {
                    return result;
                }
            }
            // Process instructions for each program
            for (const programId of allProgramIds) {
                if (config?.programIds && !config.programIds.some((id) => id == programId))
                    continue;
                if (config?.ignoreProgramIds && config.ignoreProgramIds.some((id) => id == programId))
                    continue;
                const classifiedInstructions = classifier.getInstructions(programId);
                // Process trades if needed
                if (parseType === 'trades' || parseType === 'all') {
                    const TradeParserClass = this.parserMap[programId];
                    if (TradeParserClass) {
                        const parser = new TradeParserClass(adapter, { ...dexInfo, programId: programId, amm: (0, utils_1.getProgramName)(programId) }, transferActions, classifiedInstructions);
                        result.trades.push(...parser.processTrades());
                    }
                    else if (config?.tryUnknowDEX) {
                        // Handle unknown DEX programs
                        const transfers = Object.entries(transferActions).find(([key]) => key.startsWith(programId))?.[1];
                        if (transfers && transfers.length >= 2 && transfers.some((it) => adapter.isSupportedToken(it.info.mint))) {
                            const trade = utils.processSwapData(transfers, {
                                ...dexInfo,
                                programId: programId,
                                amm: (0, utils_1.getProgramName)(programId),
                            });
                            if (trade)
                                result.trades.push(utils.attachTokenTransferInfo(trade, transferActions));
                        }
                    }
                }
                // Process liquidity if needed
                if (parseType === 'liquidity' || parseType === 'all') {
                    const LiquidityParserClass = this.parseLiquidityMap[programId];
                    if (LiquidityParserClass) {
                        const parser = new LiquidityParserClass(adapter, transferActions, classifiedInstructions);
                        result.liquidities.push(...utils.attachUserBalanceToLPs(parser.processLiquidity()));
                    }
                }
                if (parseType === 'all') {
                    const MemeParserClass = this.parseMemeEventMap[programId];
                    if (MemeParserClass) {
                        const parser = new MemeParserClass(adapter, transferActions);
                        result.memeEvents.push(...parser.processEvents());
                    }
                }
            }
            // Deduplicate trades
            if (result.trades.length > 0) {
                result.trades = [...new Map(result.trades.map((item) => [`${item.idx}-${item.signature}`, item])).values()];
                if (config.aggregateTrades == true) {
                    result.aggregateTrade = utils.attachTradeFee((0, utils_1.getFinalSwap)(result.trades));
                }
            }
            // Process transfer if needed (if no trades and no liquidity)
            if (result.trades.length == 0 && result.liquidities.length == 0) {
                if (parseType === 'transfer' || parseType === 'all') {
                    if (dexInfo.programId) {
                        const classifiedInstructions = classifier.getInstructions(dexInfo.programId);
                        const TransferParserClass = this.parseTransferMap[dexInfo.programId];
                        if (TransferParserClass) {
                            const parser = new TransferParserClass(adapter, dexInfo, transferActions, classifiedInstructions);
                            result.transfers.push(...parser.processTransfers());
                        }
                    }
                    if (result.transfers.length == 0) {
                        result.transfers.push(...Object.values(transferActions).flat());
                    }
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
     * Parse trades from transaction
     */
    parseTrades(tx, config) {
        return this.parseWithClassifier(tx, config, 'trades').trades;
    }
    /**
     * Parse liquidity events from transaction
     */
    parseLiquidity(tx, config) {
        return this.parseWithClassifier(tx, config, 'liquidity').liquidities;
    }
    /**
     * Parse transfers from transaction (if no trades and no liquidity)
     */
    parseTransfers(tx, config) {
        return this.parseWithClassifier(tx, config, 'transfer').transfers;
    }
    /**
     * Parse both trades and liquidity events from transaction
     */
    parseAll(tx, config) {
        return this.parseWithClassifier(tx, config, 'all');
    }
}
exports.DexParser = DexParser;
//# sourceMappingURL=dex-parser.js.map