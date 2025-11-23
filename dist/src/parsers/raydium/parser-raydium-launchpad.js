"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumLaunchpadParser = void 0;
const base_parser_1 = require("../base-parser");
const parser_raydium_launchpad_event_1 = require("./parser-raydium-launchpad-event");
const util_1 = require("./util");
class RaydiumLaunchpadParser extends base_parser_1.BaseParser {
    constructor(adapter, dexInfo, transferActions, classifiedInstructions) {
        super(adapter, dexInfo, transferActions, classifiedInstructions);
        this.eventParser = new parser_raydium_launchpad_event_1.RaydiumLaunchpadEventParser(adapter, transferActions);
    }
    processTrades() {
        const events = this.eventParser
            .parseInstructions(this.classifiedInstructions)
            .filter((event) => event.type === 'BUY' || event.type === 'SELL' || event.type == 'SWAP');
        return events.map((event) => this.createTradeInfo(event));
    }
    createTradeInfo(event) {
        const isBuy = event.type == 'BUY';
        const [inputToken, inputDecimal, outputToken, outputDecimal] = isBuy
            ? [
                event.quoteMint,
                this.adapter.splDecimalsMap.get(event.quoteMint),
                event.baseMint,
                this.adapter.splDecimalsMap.get(event.baseMint),
            ]
            : [
                event.baseMint,
                this.adapter.splDecimalsMap.get(event.baseMint),
                event.quoteMint,
                this.adapter.splDecimalsMap.get(event.quoteMint),
            ];
        if (!inputToken || !outputToken)
            throw new Error('Token not found');
        const trade = (0, util_1.getRaydiumTradeInfo)(event, { mint: inputToken, decimals: inputDecimal }, { mint: outputToken, decimals: outputDecimal }, {
            slot: this.adapter.slot,
            signature: this.adapter.signature,
            timestamp: this.adapter.blockTime,
            idx: event.idx,
            dexInfo: this.dexInfo,
        });
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
}
exports.RaydiumLaunchpadParser = RaydiumLaunchpadParser;
//# sourceMappingURL=parser-raydium-launchpad.js.map