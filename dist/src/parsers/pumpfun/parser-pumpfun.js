"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpfunParser = void 0;
const base_parser_1 = require("../base-parser");
const parser_pumpfun_event_1 = require("./parser-pumpfun-event");
const util_1 = require("./util");
class PumpfunParser extends base_parser_1.BaseParser {
    constructor(adapter, dexInfo, transferActions, classifiedInstructions) {
        super(adapter, dexInfo, transferActions, classifiedInstructions);
        this.eventParser = new parser_pumpfun_event_1.PumpfunEventParser(adapter, transferActions);
    }
    processTrades() {
        const events = this.eventParser
            .parseInstructions(this.classifiedInstructions)
            .filter((event) => event.type == 'BUY' || event.type == 'SELL');
        return events.map((event) => this.createTradeInfo(event));
    }
    createTradeInfo(event) {
        const trade = (0, util_1.getPumpfunTradeInfo)(event, {
            slot: this.adapter.slot,
            signature: this.adapter.signature,
            timestamp: event.timestamp,
            idx: event.idx,
            dexInfo: this.dexInfo,
        });
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
}
exports.PumpfunParser = PumpfunParser;
//# sourceMappingURL=parser-pumpfun.js.map