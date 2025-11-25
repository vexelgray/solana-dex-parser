"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraDBCParser = void 0;
const constants_1 = require("../../constants");
const base_parser_1 = require("../base-parser");
const parser_meteora_dbc_event_1 = require("./parser-meteora-dbc-event");
class MeteoraDBCParser extends base_parser_1.BaseParser {
    constructor(adapter, dexInfo, transferActions, classifiedInstructions) {
        super(adapter, dexInfo, transferActions, classifiedInstructions);
        this.eventParser = new parser_meteora_dbc_event_1.MeteoraDBCEventParser(adapter, transferActions);
    }
    processTrades() {
        const events = this.eventParser
            .parseInstructions(this.classifiedInstructions)
            .filter((event) => event.type == "BUY" || event.type == "SELL" || event.type == "SWAP");
        return events.map((event) => this.createTradeInfo(event));
    }
    createTradeInfo(event) {
        const trade = {
            type: event.type,
            Pool: [event.pool], // Bonding curve / pool address
            inputToken: event.inputToken,
            outputToken: event.outputToken,
            user: event.user,
            programId: this.dexInfo.programId,
            amm: constants_1.DEX_PROGRAMS.METEORA_DBC.name,
            amms: [constants_1.DEX_PROGRAMS.METEORA_DBC.name],
            route: this.dexInfo.route,
            slot: this.adapter.slot,
            timestamp: event.timestamp,
            signature: this.adapter.signature,
            idx: event.idx,
            // Include fee information extracted from EvtSwap/EvtSwap2 CPI events
            fee: event.feeRaw ? {
                mint: event.feeMint,
                amount: event.fee,
                amountRaw: event.feeRaw,
                decimals: event.feeDecimals,
            } : undefined,
        };
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
}
exports.MeteoraDBCParser = MeteoraDBCParser;
//# sourceMappingURL=parser-meteora-dbc.js.map