"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dotenv_1 = __importDefault(require("dotenv"));
const parsers_1 = require("../parsers");
const transaction_adapter_1 = require("../transaction-adapter");
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
    describe('Pumpfun', () => {
        it('pumpfun events', async () => {
            const tx = await connection.getTransaction('2CYBHseAoZy1WHTNnVj1cTV9gnDeXE5WHAq6xXP62RL6h54uN1ft1AM1r5VkhMXYtav54CaP4nbR2rDe5TZdPzbR', // create & complete
            // "4Cod1cNGv6RboJ7rSB79yeVCR4Lfd25rFgLY3eiPJfTJjTGyYP1r2i1upAYZHQsWDqUbGd1bhTRm1bpSQcpWMnEz", // create
            // "v8s37Srj6QPMtRC1HfJcrSenCHvYebHiGkHVuFFiQ6UviqHnoVx4U77M3TZhQQXewXadHYh5t35LkesJi3ztPZZ", // complete
            {
                maxSupportedTransactionVersion: 0,
            });
            if (!tx)
                throw new Error('Transaction not found');
            const parser = new parsers_1.PumpfunEventParser(new transaction_adapter_1.TransactionAdapter(tx), {});
            const events = parser.processEvents();
            console.log(events);
            expect(events.length).toBeGreaterThan(1);
        });
    });
});
//# sourceMappingURL=parser-pumpfun.test.js.map