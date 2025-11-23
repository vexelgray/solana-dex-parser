"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dex_parser_1 = require("../dex-parser");
const grpc_block_test_case_1 = require("./grpc-block.test.case");
describe('Parser', () => {
    it("grpc-block", async () => {
        const parser = new dex_parser_1.DexParser();
        const block = grpc_block_test_case_1.blockSubscribe.block;
        block.transactions.forEach((tx, idx) => {
            if (tx) {
                const result = parser.parseAll({
                    ...tx,
                    slot: Number(block.slot),
                    blockTime: Number(block.blockTime.timestamp)
                });
                console.log(`tx-${tx.signature} > index:${idx}`, JSON.stringify(result, null, 2));
            }
        });
    });
});
//# sourceMappingURL=grpc-block.test.js.map