"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumCPMMPoolParser = void 0;
const constants_1 = require("../../constants");
const parser_raydium_liquidity_base_1 = require("./parser-raydium-liquidity-base");
class RaydiumCPMMPoolParser extends parser_raydium_liquidity_base_1.RaydiumLiquidityParserBase {
    getPoolAction(data) {
        const instructionType = data.slice(0, 8);
        if (instructionType.equals(constants_1.DISCRIMINATORS.RAYDIUM_CPMM.CREATE))
            return 'CREATE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.RAYDIUM_CPMM.ADD_LIQUIDITY))
            return 'ADD';
        if (instructionType.equals(constants_1.DISCRIMINATORS.RAYDIUM_CPMM.REMOVE_LIQUIDITY))
            return 'REMOVE';
        return null;
    }
    getEventConfig(type) {
        const configs = {
            CREATE: {
                eventType: 'CREATE',
                poolIdIndex: 3,
                lpMintIndex: 6,
                tokenAmountOffsets: { token0: 8, token1: 16, lp: 0 },
            },
            ADD: {
                eventType: 'ADD',
                poolIdIndex: 2,
                lpMintIndex: 12,
                tokenAmountOffsets: { token0: 16, token1: 24, lp: 8 },
            },
            REMOVE: {
                eventType: 'REMOVE',
                poolIdIndex: 2,
                lpMintIndex: 12,
                tokenAmountOffsets: { token0: 16, token1: 24, lp: 8 },
            },
        };
        return configs[type];
    }
}
exports.RaydiumCPMMPoolParser = RaydiumCPMMPoolParser;
//# sourceMappingURL=liquidity-raydium-cpmm.js.map