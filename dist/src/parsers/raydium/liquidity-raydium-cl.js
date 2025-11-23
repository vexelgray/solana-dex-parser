"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumCLPoolParser = void 0;
const constants_1 = require("../../constants");
const parser_raydium_liquidity_base_1 = require("./parser-raydium-liquidity-base");
class RaydiumCLPoolParser extends parser_raydium_liquidity_base_1.RaydiumLiquidityParserBase {
    getPoolAction(data) {
        const instructionType = data.slice(0, 8);
        for (const [name, discriminator] of Object.entries(constants_1.DISCRIMINATORS.RAYDIUM_CL.CREATE)) {
            if (instructionType.equals(discriminator))
                return { name, type: 'CREATE' };
        }
        for (const [name, discriminator] of Object.entries(constants_1.DISCRIMINATORS.RAYDIUM_CL.ADD_LIQUIDITY)) {
            if (instructionType.equals(discriminator))
                return { name, type: 'ADD' };
        }
        for (const [name, discriminator] of Object.entries(constants_1.DISCRIMINATORS.RAYDIUM_CL.REMOVE_LIQUIDITY)) {
            if (instructionType.equals(discriminator))
                return { name, type: 'REMOVE' };
        }
        return null;
    }
    getEventConfig(type, instructionType) {
        const configs = {
            CREATE: {
                eventType: 'CREATE',
                poolIdIndex: ['openPosition', 'openPositionV2'].includes(instructionType.name) ? 5 : 4,
                lpMintIndex: ['openPosition', 'openPositionV2'].includes(instructionType.name) ? 5 : 4,
            },
            ADD: {
                eventType: 'ADD',
                poolIdIndex: 2,
                lpMintIndex: 2,
                tokenAmountOffsets: { token0: 32, token1: 24, lp: 8 },
            },
            REMOVE: {
                eventType: 'REMOVE',
                poolIdIndex: 3,
                lpMintIndex: 3,
                tokenAmountOffsets: { token0: 32, token1: 24, lp: 8 },
            },
        };
        return configs[type];
    }
}
exports.RaydiumCLPoolParser = RaydiumCLPoolParser;
//# sourceMappingURL=liquidity-raydium-cl.js.map