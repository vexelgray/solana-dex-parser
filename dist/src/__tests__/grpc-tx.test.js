"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dex_parser_1 = require("../dex-parser");
const grpc_tx_test_case_1 = require("./grpc-tx.test.case");
const rs = new dex_parser_1.DexParser().parseAll(grpc_tx_test_case_1.tx.transaction.transaction);
console.log(rs, JSON.stringify(rs, null, 2));
//# sourceMappingURL=grpc-tx.test.js.map