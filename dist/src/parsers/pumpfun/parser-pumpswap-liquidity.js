"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpswapLiquidityParser = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const base_liquidity_parser_1 = require("../base-liquidity-parser");
const parser_pumpswap_event_1 = require("./parser-pumpswap-event");
class PumpswapLiquidityParser extends base_liquidity_parser_1.BaseLiquidityParser {
    constructor(adapter, transferActions, classifiedInstructions) {
        super(adapter, transferActions, classifiedInstructions);
        this.eventParser = new parser_pumpswap_event_1.PumpswapEventParser(adapter);
    }
    processLiquidity() {
        const events = this.eventParser
            .parseInstructions(this.classifiedInstructions)
            .filter((event) => ['CREATE', 'ADD', 'REMOVE'].includes(event.type));
        return events.length > 0 ? this.parseLiquidityEvents(events) : [];
    }
    parseLiquidityEvents(events) {
        if (!events.length)
            return [];
        return events
            .map((event) => {
            switch (event.type) {
                case 'CREATE':
                    return this.parseCreateEvent(event);
                case 'ADD':
                    return this.parseDepositEvent(event);
                case 'REMOVE':
                    return this.parseWithdrawEvent(event);
                default:
                    return null;
            }
        })
            .filter((it) => it != null);
    }
    parseCreateEvent(data) {
        const event = data.data;
        return {
            ...this.adapter.getPoolEventBase('CREATE', constants_1.DEX_PROGRAMS.PUMP_SWAP.id),
            idx: data.idx,
            poolId: event.pool,
            poolLpMint: event.lpMint,
            token0Mint: event.baseMint,
            token1Mint: event.quoteMint,
            token0Amount: (0, types_1.convertToUiAmount)(event.baseAmountIn, event.baseMintDecimals),
            token0AmountRaw: event.baseAmountIn.toString(),
            token1Amount: (0, types_1.convertToUiAmount)(event.quoteAmountIn, event.quoteMintDecimals),
            token1AmountRaw: event.quoteAmountIn.toString(),
            token0Decimals: event.baseMintDecimals,
            token1Decimals: event.quoteMintDecimals,
        };
    }
    parseDepositEvent(data) {
        const event = data.data;
        const token0Mint = this.adapter.splTokenMap.get(event.userBaseTokenAccount).mint;
        const token0Decimals = this.adapter.getTokenDecimals(token0Mint);
        const token1Mint = this.adapter.splTokenMap.get(event.userQuoteTokenAccount).mint;
        const token1Decimals = this.adapter.getTokenDecimals(token1Mint);
        return {
            ...this.adapter.getPoolEventBase('ADD', constants_1.DEX_PROGRAMS.PUMP_SWAP.id),
            idx: data.idx,
            poolId: event.pool,
            poolLpMint: this.adapter.splTokenMap.get(event.userPoolTokenAccount).mint,
            token0Mint: token0Mint,
            token1Mint: token1Mint,
            token0Amount: (0, types_1.convertToUiAmount)(event.baseAmountIn, token0Decimals),
            token0AmountRaw: event.baseAmountIn.toString(),
            token1Amount: (0, types_1.convertToUiAmount)(event.quoteAmountIn, token1Decimals),
            token1AmountRaw: event.quoteAmountIn.toString(),
            token0Decimals: token0Decimals,
            token1Decimals: token1Decimals,
        };
    }
    parseWithdrawEvent(data) {
        const event = data.data;
        const token0Mint = this.adapter.splTokenMap.get(event.userBaseTokenAccount).mint;
        const token0Decimals = this.adapter.getTokenDecimals(token0Mint);
        const token1Mint = this.adapter.splTokenMap.get(event.userQuoteTokenAccount).mint;
        const token1Decimals = this.adapter.getTokenDecimals(token1Mint);
        return {
            ...this.adapter.getPoolEventBase('REMOVE', constants_1.DEX_PROGRAMS.PUMP_SWAP.id),
            idx: data.idx,
            poolId: event.pool,
            poolLpMint: this.adapter.splTokenMap.get(event.userPoolTokenAccount).mint,
            token0Mint: token0Mint,
            token1Mint: token1Mint,
            token0Amount: (0, types_1.convertToUiAmount)(event.baseAmountOut, token0Decimals),
            token0AmountRaw: event.baseAmountOut.toString(),
            token1Amount: (0, types_1.convertToUiAmount)(event.quoteAmountOut, token1Decimals),
            token1AmountRaw: event.quoteAmountOut.toString(),
            token0Decimals: token0Decimals,
            token1Decimals: token1Decimals,
        };
    }
}
exports.PumpswapLiquidityParser = PumpswapLiquidityParser;
//# sourceMappingURL=parser-pumpswap-liquidity.js.map