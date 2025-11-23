"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoopfunTradeInfo = void 0;
const constants_1 = require("../../constants");
const getBoopfunTradeInfo = (event, info) => {
    const isBuy = event.type === 'BUY';
    return {
        type: event.type,
        Pool: event.bondingCurve ? [event.bondingCurve] : [],
        inputToken: event.inputToken,
        outputToken: event.outputToken,
        user: event.user,
        programId: constants_1.DEX_PROGRAMS.BOOP_FUN.id,
        amm: info.dexInfo?.amm || constants_1.DEX_PROGRAMS.BOOP_FUN.name,
        route: info.dexInfo?.route || '',
        slot: info.slot,
        timestamp: info.timestamp,
        signature: info.signature,
        idx: info.idx || '',
    };
};
exports.getBoopfunTradeInfo = getBoopfunTradeInfo;
//# sourceMappingURL=util.js.map