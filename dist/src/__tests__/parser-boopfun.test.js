"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const dex_parser_1 = require("../dex-parser");
const parsers_1 = require("../parsers");
const transaction_adapter_1 = require("../transaction-adapter");
const transaction_utils_1 = require("../transaction-utils");
dotenv_1.default.config();
describe('Parser', () => {
    let connection;
    beforeAll(async () => {
        // Initialize connection
        const rpcUrl = process.env.SOLANA_RPC_URL;
        if (!rpcUrl) {
            throw new Error('SOLANA_RPC_URL environment variable is not set');
        }
        connection = new web3_js_1.Connection(rpcUrl);
    });
    describe('Boopfun', () => {
        it('boopfun events', async () => {
            const tx = await connection.getTransaction('4YxPRX9p3rdN7H6cbjC6pKqyQfTu589nkVH3PqxFQyaoP5cZxEgfLK2SJmHFzUTXoJceGtxC8eGXeDqFjLE2UycH', // create & complete
            // "28S2MakapF1zTrnqYHdMxdnN9uqAfKV2fa5ez9HpE466L3xWz8AXwsz4eKXXnpvX8p49Ckbp26doG5fgW5f6syk9", // buy
            //  "3Lyh3wAPkcLGKydqT6VdjMsorLUJqEuDeppxh79sQjGxuLiMqMgB75aSJyZsM3y3jJRqdLJYZhNUBaLeKQ8vL4An", // sell
            // "3yLq2ECkAtzFrvAH3V5nhQirZMNRj28EXfFifBYoeJmfAhutVfjqVnjewAExkSaz9ENfUXf511T5zSMfnFiVj1Jy", // complete
            {
                maxSupportedTransactionVersion: 0,
            });
            if (!tx)
                throw new Error('Transaction not found');
            // parse Boopfun trades (buy, sell)
            const dexParser = new dex_parser_1.DexParser();
            const result = dexParser.parseAll(tx);
            // console.log('result', JSON.stringify(result, null, 2));
            // parse Boopfun events (create, buy, sell, complete)
            const adapter = new transaction_adapter_1.TransactionAdapter(tx);
            const utils = new transaction_utils_1.TransactionUtils(adapter);
            const transferActions = utils.getTransferActions();
            const parser = new parsers_1.BoopfunEventParser(adapter, transferActions);
            const events = parser.processEvents();
            console.log('events', events);
            expect(events.length).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=parser-boopfun.test.js.map