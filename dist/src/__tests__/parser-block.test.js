"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const dex_parser_1 = require("../dex-parser");
dotenv_1.default.config();
describe('Parser', () => {
    let connection;
    beforeAll(async () => {
        // Initialize connection
        const rpcUrl = process.env.SOLANA_RPC_URL;
        if (!rpcUrl) {
            throw new Error('SOLANA_RPC_URL environment variable is not set');
        }
        connection = new web3_js_1.Connection(rpcUrl, {
            commitment: 'confirmed',
        });
    });
    describe('Dex', () => {
        describe('parseTransaction', () => {
            it("block", async () => {
                const parser = new dex_parser_1.DexParser();
                const s1 = Date.now();
                const block = await connection.getBlock(337441395, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                    transactionDetails: 'full',
                });
                const s2 = Date.now();
                if (!block) {
                    throw new Error("Block not found");
                }
                const ts = [], liqs = [];
                console.log('>>>', block.transactions.length);
                block.transactions.forEach((tx, idx) => {
                    // if (tx.meta?.err) {
                    //   return;
                    // }
                    if (idx == 1504 || idx == 1264) {
                        console.log('>K>', tx.transaction.signatures[0]);
                        // fs.writeFileSync(`./src/__tests__/tx-${tx.transaction.signatures[0]}.json`, JSON.stringify(tx, null, 2));
                    }
                    // const { trades, liquidities } = parser.parseAll({ ...tx!, slot: (block.parentSlot + 1), blockTime: block.blockTime } as any, { tryUnknowDEX: false });
                    // ts.push(...trades);
                    // liqs.push(...liquidities);
                });
                // const s3 = Date.now();
                // console.log(`Fetch block: ${(s2 - s1) / 1000} s > Parser: ${(s3 - s2) / 1000} s > Hits: ${ts.length + liqs.length} / ${block.transactions.length}`);
            });
            // it("json-block", async () => {
            //   const parser = new DexParser();
            //   const data = fs.readFileSync("./src/__tests__/tx-55gZaGoRSov1S9yQE3azRhteZrxwswk9YWW4E7z3XBBaLL9VFdoMnJTYfcixGXJTpp2yGmuCznqw8tj78E9po8UC.json", { encoding: "utf8" });
            //   const tx = JSON.parse(data);
            //   const { trades, liquidities } = parser.parseAll(tx as any, { tryUnknowDEX: false });
            //   console.log('trades', trades);
            //   console.log('liquidities', liquidities);
            // });
        });
    });
});
//# sourceMappingURL=parser-block.test.js.map