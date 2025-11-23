"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumV4PoolParser = void 0;
const constants_1 = require("../../constants");
const parser_raydium_liquidity_base_1 = require("./parser-raydium-liquidity-base");
class RaydiumV4PoolParser extends parser_raydium_liquidity_base_1.RaydiumLiquidityParserBase {
    getPoolAction(data) {
        const instructionType = data.slice(0, 1);
        if (instructionType.equals(constants_1.DISCRIMINATORS.RAYDIUM.CREATE))
            return 'CREATE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.RAYDIUM.ADD_LIQUIDITY))
            return 'ADD';
        if (instructionType.equals(constants_1.DISCRIMINATORS.RAYDIUM.REMOVE_LIQUIDITY))
            return 'REMOVE';
        return null;
    }
    getEventConfig(type) {
        const configs = {
            CREATE: { eventType: 'CREATE', poolIdIndex: 4, lpMintIndex: 7 },
            ADD: { eventType: 'ADD', poolIdIndex: 1, lpMintIndex: 5 },
            REMOVE: { eventType: 'REMOVE', poolIdIndex: 1, lpMintIndex: 5 },
        };
        return configs[type];
    }
}
exports.RaydiumV4PoolParser = RaydiumV4PoolParser;
//# sourceMappingURL=liquidity-raydium-v4.js.map