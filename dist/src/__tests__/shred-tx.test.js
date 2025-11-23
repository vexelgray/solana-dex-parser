"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dex_parser_1 = require("../dex-parser");
const transaction_adapter_1 = require("../transaction-adapter");
const shred_tx_test_case_1 = require("./shred-tx.test.case");
describe('Shred Parser', () => {
    const parser = new dex_parser_1.DexParser();
    shred_tx_test_case_1.txs.forEach((tx) => {
        if (tx.skipTest)
            return;
        const adapter = new transaction_adapter_1.TransactionAdapter(tx.transaction);
        it(`shred-stream-${adapter.signature}`, async () => {
            const rs = parser.parseAll(tx.transaction);
            console.log(rs, JSON.stringify(rs, null, 2));
        });
    });
});
//# sourceMappingURL=shred-tx.test.js.map