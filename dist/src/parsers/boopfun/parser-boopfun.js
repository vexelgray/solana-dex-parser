"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoopfunParser = void 0;
const base_parser_1 = require("../base-parser");
const parser_boopfun_event_1 = require("./parser-boopfun-event");
const util_1 = require("./util");
/**
 * Parse Boopfun trades (BUY/SELL)
 */
class BoopfunParser extends base_parser_1.BaseParser {
    constructor(adapter, dexInfo, transferActions, classifiedInstructions) {
        super(adapter, dexInfo, transferActions, classifiedInstructions);
        this.eventParser = new parser_boopfun_event_1.BoopfunEventParser(adapter, transferActions);
    }
    processTrades() {
        const events = this.eventParser
            .parseInstructions(this.classifiedInstructions)
            .filter((event) => event.type === 'BUY' || event.type === 'SELL' || event.type === 'SWAP');
        return events.map((event) => this.createTradeInfo(event));
    }
    createTradeInfo(event) {
        const trade = (0, util_1.getBoopfunTradeInfo)(event, {
            slot: this.adapter.slot,
            signature: this.adapter.signature,
            timestamp: event.timestamp,
            idx: event.idx,
            dexInfo: this.dexInfo,
        });
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
}
exports.BoopfunParser = BoopfunParser;
//# sourceMappingURL=parser-boopfun.js.map