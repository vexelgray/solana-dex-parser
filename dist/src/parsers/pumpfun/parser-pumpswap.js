"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpswapParser = void 0;
const base_parser_1 = require("../base-parser");
const parser_pumpswap_event_1 = require("./parser-pumpswap-event");
const util_1 = require("./util");
class PumpswapParser extends base_parser_1.BaseParser {
    constructor(adapter, dexInfo, transferActions, classifiedInstructions) {
        super(adapter, dexInfo, transferActions, classifiedInstructions);
        this.eventParser = new parser_pumpswap_event_1.PumpswapEventParser(adapter);
    }
    processTrades() {
        const events = this.eventParser
            .parseInstructions(this.classifiedInstructions)
            .filter((event) => ['BUY', 'SELL'].includes(event.type));
        return events.map((event) => (event.type === 'BUY' ? this.createBuyInfo(event) : this.createSellInfo(event)));
    }
    createBuyInfo(data) {
        const event = data.data;
        const inputMint = this.adapter.splTokenMap.get(event.userQuoteTokenAccount)?.mint;
        if (!inputMint)
            throw new Error('inputMint not found');
        const outputMint = this.adapter.splTokenMap.get(event.userBaseTokenAccount)?.mint;
        if (!outputMint)
            throw new Error('outputMint not found');
        const feeMint = this.adapter.splTokenMap.get(event.protocolFeeRecipientTokenAccount)?.mint;
        if (!feeMint)
            throw new Error('feeMint not found');
        const inputDecimal = this.adapter.getTokenDecimals(inputMint);
        const ouptDecimal = this.adapter.getTokenDecimals(outputMint);
        const feeDecimal = this.adapter.getTokenDecimals(feeMint);
        const trade = (0, util_1.getPumpswapBuyInfo)(event, { mint: inputMint, decimals: inputDecimal }, { mint: outputMint, decimals: ouptDecimal }, { mint: feeMint, decimals: feeDecimal }, {
            slot: data.slot,
            signature: data.signature,
            timestamp: data.timestamp,
            idx: data.idx,
            dexInfo: this.dexInfo,
        });
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
    createSellInfo(data) {
        const event = data.data;
        const inputMint = this.adapter.splTokenMap.get(event.userBaseTokenAccount)?.mint;
        if (!inputMint)
            throw new Error('inputMint not found');
        const outputMint = this.adapter.splTokenMap.get(event.userQuoteTokenAccount)?.mint;
        if (!outputMint)
            throw new Error('outputMint not found');
        const feeMint = this.adapter.splTokenMap.get(event.protocolFeeRecipientTokenAccount)?.mint;
        if (!feeMint)
            throw new Error('feeMint not found');
        const inputDecimal = this.adapter.getTokenDecimals(inputMint);
        const ouptDecimal = this.adapter.getTokenDecimals(outputMint);
        const feeDecimal = this.adapter.getTokenDecimals(feeMint);
        const trade = (0, util_1.getPumpswapSellInfo)(event, { mint: inputMint, decimals: inputDecimal }, { mint: outputMint, decimals: ouptDecimal }, { mint: feeMint, decimals: feeDecimal }, {
            slot: data.slot,
            signature: data.signature,
            timestamp: data.timestamp,
            idx: data.idx,
            dexInfo: this.dexInfo,
        });
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
}
exports.PumpswapParser = PumpswapParser;
//# sourceMappingURL=parser-pumpswap.js.map