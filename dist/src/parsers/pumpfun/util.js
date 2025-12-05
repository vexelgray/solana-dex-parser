"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPumpswapSellInfo = exports.getPumpswapBuyInfo = exports.getPumpfunTradeInfo = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const getPumpfunTradeInfo = (event, info) => {
    return {
        type: event.type,
        Pool: event.poolAddress ? [event.poolAddress] : [],
        inputToken: event.inputToken,
        outputToken: event.outputToken,
        user: event.user,
        programId: constants_1.DEX_PROGRAMS.PUMP_FUN.id,
        amm: info.dexInfo?.amm || constants_1.DEX_PROGRAMS.PUMP_FUN.name,
        route: info.dexInfo?.route || '',
        slot: info.slot,
        timestamp: info.timestamp,
        signature: info.signature,
        idx: info.idx || '',
    };
};
exports.getPumpfunTradeInfo = getPumpfunTradeInfo;
const getPumpswapBuyInfo = (event, inputToken, outputToken, feeToken, info) => {
    const { mint: inputMint, decimals: inputDecimal } = inputToken;
    const { mint: outputMint, decimals: ouptDecimal } = outputToken;
    const { mint: feeMint, decimals: feeDecimal } = feeToken;
    const feeAmt = BigInt(event.protocolFee) + BigInt(event.coinCreatorFee);
    const trade = {
        type: (0, utils_1.getTradeType)(inputMint, outputMint),
        Pool: [event.pool],
        inputToken: {
            mint: inputMint,
            amount: (0, types_1.convertToUiAmount)(event.quoteAmountInWithLpFee, inputDecimal),
            amountRaw: event.quoteAmountInWithLpFee.toString(),
            decimals: inputDecimal,
        },
        outputToken: {
            mint: outputMint,
            amount: (0, types_1.convertToUiAmount)(event.baseAmountOut, ouptDecimal),
            amountRaw: event.baseAmountOut.toString(),
            decimals: ouptDecimal,
        },
        fee: {
            mint: feeMint,
            amount: (0, types_1.convertToUiAmount)(feeAmt, feeDecimal),
            amountRaw: feeAmt.toString(),
            decimals: feeDecimal,
        },
        fees: [
            {
                mint: feeMint,
                amount: (0, types_1.convertToUiAmount)(event.protocolFee, feeDecimal),
                amountRaw: event.protocolFee.toString(),
                decimals: feeDecimal,
                dex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
                type: 'protocol',
                recipient: event.protocolFeeRecipient,
            },
        ],
        user: event.user,
        programId: info.dexInfo?.programId || constants_1.DEX_PROGRAMS.PUMP_SWAP.id,
        amm: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
        route: info.dexInfo?.route || '',
        slot: info.slot,
        timestamp: info.timestamp,
        signature: info.signature,
        idx: info.idx || '',
    };
    if (trade.fees && BigInt(event.coinCreatorFee) > 0) {
        trade.fees.push({
            mint: feeMint,
            amount: (0, types_1.convertToUiAmount)(event.coinCreatorFee, feeDecimal),
            amountRaw: event.coinCreatorFee.toString(),
            decimals: feeDecimal,
            dex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
            type: 'coinCreator',
            recipient: event.coinCreator,
        });
    }
    return trade;
};
exports.getPumpswapBuyInfo = getPumpswapBuyInfo;
const getPumpswapSellInfo = (event, inputToken, outputToken, feeToken, info) => {
    const { mint: inputMint, decimals: inputDecimal } = inputToken;
    const { mint: outputMint, decimals: ouptDecimal } = outputToken;
    const { mint: feeMint, decimals: feeDecimal } = feeToken;
    const feeAmt = BigInt(event.protocolFee) + BigInt(event.coinCreatorFee);
    const trade = {
        type: (0, utils_1.getTradeType)(inputMint, outputMint),
        Pool: [event.pool],
        inputToken: {
            mint: inputMint,
            amount: (0, types_1.convertToUiAmount)(event.baseAmountIn, inputDecimal),
            amountRaw: event.baseAmountIn.toString(),
            decimals: inputDecimal,
        },
        outputToken: {
            mint: outputMint,
            amount: (0, types_1.convertToUiAmount)(event.userQuoteAmountOut, ouptDecimal),
            amountRaw: event.userQuoteAmountOut.toString(),
            decimals: ouptDecimal,
        },
        fee: {
            mint: feeMint,
            amount: (0, types_1.convertToUiAmount)(feeAmt, feeDecimal),
            amountRaw: event.protocolFee.toString(),
            decimals: feeDecimal,
            dex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
        },
        fees: [
            {
                mint: feeMint,
                amount: (0, types_1.convertToUiAmount)(event.protocolFee, feeDecimal),
                amountRaw: event.protocolFee.toString(),
                decimals: feeDecimal,
                dex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
                type: 'protocol',
                recipient: event.protocolFeeRecipient,
            },
        ],
        user: event.user,
        programId: info.dexInfo?.programId || constants_1.DEX_PROGRAMS.PUMP_SWAP.id,
        amm: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
        route: info.dexInfo?.route || '',
        slot: info.slot,
        timestamp: info.timestamp,
        signature: info.signature,
        idx: info.idx || '',
    };
    if (trade.fees && BigInt(event.coinCreatorFee) > 0) {
        trade.fees.push({
            mint: feeMint,
            amount: (0, types_1.convertToUiAmount)(event.coinCreatorFee, feeDecimal),
            amountRaw: event.coinCreatorFee.toString(),
            decimals: feeDecimal,
            dex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
            type: 'coinCreator',
            recipient: event.coinCreator,
        });
    }
    return trade;
};
exports.getPumpswapSellInfo = getPumpswapSellInfo;
//# sourceMappingURL=util.js.map