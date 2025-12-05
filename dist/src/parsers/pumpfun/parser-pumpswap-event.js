"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpswapEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const decoders_1 = require("../../decoders");
const instruction_classifier_1 = require("../../instruction-classifier");
const utils_1 = require("../../utils");
class PumpswapEventParser {
    constructor(adapter) {
        this.adapter = adapter;
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.PUMP_SWAP.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                const buffer = buffer_1.Buffer.from(data);
                // Use IDL decoder to identify and decode the event
                const decoded = decoders_1.pumpswapDecoder.decodeAnyEvent(buffer);
                if (!decoded)
                    return null;
                let eventData;
                switch (decoded.type) {
                    case 'BUY':
                        eventData = this.convertBuyEvent(decoded.data);
                        break;
                    case 'SELL':
                        eventData = this.convertSellEvent(decoded.data);
                        break;
                    case 'CREATE':
                        eventData = this.convertCreatePoolEvent(decoded.data);
                        break;
                    case 'ADD':
                        eventData = this.convertDepositEvent(decoded.data);
                        break;
                    case 'REMOVE':
                        eventData = this.convertWithdrawEvent(decoded.data);
                        break;
                    default:
                        return null;
                }
                return {
                    type: decoded.type,
                    data: eventData,
                    slot: this.adapter.slot,
                    timestamp: this.adapter.blockTime || 0,
                    signature: this.adapter.signature,
                    idx: `${outerIndex}-${innerIndex ?? 0}`,
                };
            }
            catch (error) {
                console.error('Failed to parse Pumpswap event:', error);
                throw error;
            }
        })
            .filter((event) => event !== null));
    }
    convertBuyEvent(evt) {
        return {
            timestamp: Number(evt.timestamp),
            baseAmountOut: evt.baseAmountOut,
            maxQuoteAmountIn: evt.maxQuoteAmountIn,
            userBaseTokenReserves: evt.userBaseTokenReserves,
            userQuoteTokenReserves: evt.userQuoteTokenReserves,
            poolBaseTokenReserves: evt.poolBaseTokenReserves,
            poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
            quoteAmountIn: evt.quoteAmountIn,
            lpFeeBasisPoints: evt.lpFeeBasisPoints,
            lpFee: evt.lpFee,
            protocolFeeBasisPoints: evt.protocolFeeBasisPoints,
            protocolFee: evt.protocolFee,
            quoteAmountInWithLpFee: evt.quoteAmountInWithLpFee,
            userQuoteAmountIn: evt.userQuoteAmountIn,
            pool: evt.pool,
            user: evt.user,
            userBaseTokenAccount: evt.userBaseTokenAccount,
            userQuoteTokenAccount: evt.userQuoteTokenAccount,
            protocolFeeRecipient: evt.protocolFeeRecipient,
            protocolFeeRecipientTokenAccount: evt.protocolFeeRecipientTokenAccount,
            coinCreator: evt.coinCreator ?? '11111111111111111111111111111111',
            coinCreatorFeeBasisPoints: evt.coinCreatorFeeBasisPoints ?? 0n,
            coinCreatorFee: evt.coinCreatorFee ?? 0n,
            isMayhemMode: evt.isMayhemMode,
        };
    }
    convertSellEvent(evt) {
        return {
            timestamp: Number(evt.timestamp),
            baseAmountIn: evt.baseAmountIn,
            minQuoteAmountOut: evt.minQuoteAmountOut,
            userBaseTokenReserves: evt.userBaseTokenReserves,
            userQuoteTokenReserves: evt.userQuoteTokenReserves,
            poolBaseTokenReserves: evt.poolBaseTokenReserves,
            poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
            quoteAmountOut: evt.quoteAmountOut,
            lpFeeBasisPoints: evt.lpFeeBasisPoints,
            lpFee: evt.lpFee,
            protocolFeeBasisPoints: evt.protocolFeeBasisPoints,
            protocolFee: evt.protocolFee,
            quoteAmountOutWithoutLpFee: evt.quoteAmountOutWithoutLpFee,
            userQuoteAmountOut: evt.userQuoteAmountOut,
            pool: evt.pool,
            user: evt.user,
            userBaseTokenAccount: evt.userBaseTokenAccount,
            userQuoteTokenAccount: evt.userQuoteTokenAccount,
            protocolFeeRecipient: evt.protocolFeeRecipient,
            protocolFeeRecipientTokenAccount: evt.protocolFeeRecipientTokenAccount,
            coinCreator: evt.coinCreator ?? '11111111111111111111111111111111',
            coinCreatorFeeBasisPoints: evt.coinCreatorFeeBasisPoints ?? 0n,
            coinCreatorFee: evt.coinCreatorFee ?? 0n,
            isMayhemMode: evt.isMayhemMode,
        };
    }
    convertCreatePoolEvent(evt) {
        return {
            timestamp: Number(evt.timestamp),
            index: evt.index,
            creator: evt.creator,
            baseMint: evt.baseMint,
            quoteMint: evt.quoteMint,
            baseMintDecimals: evt.baseMintDecimals,
            quoteMintDecimals: evt.quoteMintDecimals,
            baseAmountIn: evt.baseAmountIn,
            quoteAmountIn: evt.quoteAmountIn,
            poolBaseAmount: evt.poolBaseAmount,
            poolQuotAmount: evt.poolQuoteAmount,
            minimumLiquidity: evt.minimumLiquidity,
            initialLiquidity: evt.initialLiquidity,
            lpTokenAmountOut: evt.lpTokenAmountOut,
            poolBump: evt.poolBump,
            pool: evt.pool,
            lpMint: evt.lpMint,
            userBaseTokenAccount: evt.userBaseTokenAccount,
            userQuoteTokenAccount: evt.userQuoteTokenAccount,
        };
    }
    convertDepositEvent(evt) {
        return {
            timestamp: Number(evt.timestamp),
            lpTokenAmountOut: evt.lpTokenAmountOut,
            maxBaseAmountIn: evt.maxBaseAmountIn,
            maxQuoteAmountIn: evt.maxQuoteAmountIn,
            userBaseTokenReserves: evt.userBaseTokenReserves,
            userQuoteTokenReserves: evt.userQuoteTokenReserves,
            poolBaseTokenReserves: evt.poolBaseTokenReserves,
            poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
            baseAmountIn: evt.baseAmountIn,
            quoteAmountIn: evt.quoteAmountIn,
            lpMintSupply: evt.lpMintSupply,
            pool: evt.pool,
            user: evt.user,
            userBaseTokenAccount: evt.userBaseTokenAccount,
            userQuoteTokenAccount: evt.userQuoteTokenAccount,
            userPoolTokenAccount: evt.userPoolTokenAccount,
        };
    }
    convertWithdrawEvent(evt) {
        return {
            timestamp: Number(evt.timestamp),
            lpTokenAmountIn: evt.lpTokenAmountIn,
            minBaseAmountOut: evt.minBaseAmountOut,
            minQuoteAmountOut: evt.minQuoteAmountOut,
            userBaseTokenReserves: evt.userBaseTokenReserves,
            userQuoteTokenReserves: evt.userQuoteTokenReserves,
            poolBaseTokenReserves: evt.poolBaseTokenReserves,
            poolQuoteTokenReserves: evt.poolQuoteTokenReserves,
            baseAmountOut: evt.baseAmountOut,
            quoteAmountOut: evt.quoteAmountOut,
            lpMintSupply: evt.lpMintSupply,
            pool: evt.pool,
            user: evt.user,
            userBaseTokenAccount: evt.userBaseTokenAccount,
            userQuoteTokenAccount: evt.userQuoteTokenAccount,
            userPoolTokenAccount: evt.userPoolTokenAccount,
        };
    }
}
exports.PumpswapEventParser = PumpswapEventParser;
//# sourceMappingURL=parser-pumpswap-event.js.map