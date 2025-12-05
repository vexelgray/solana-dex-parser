"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const dex_parser_1 = require("../dex-parser");
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
async function parseSignature(signature) {
    const connection = new web3_js_1.Connection(RPC_URL, 'confirmed');
    const parser = new dex_parser_1.DexParser();
    console.log(`\nFetching transaction: ${signature}`);
    console.log(`RPC: ${RPC_URL}\n`);
    const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        console.error('Transaction not found');
        process.exit(1);
    }
    console.log('Transaction found, parsing...\n');
    const result = parser.parseAll(tx, {
        tryUnknowDEX: true,
        aggregateTrades: false,
    });
    console.log('='.repeat(80));
    console.log('PARSE RESULT');
    console.log('='.repeat(80));
    console.log(`\nSignature: ${result.signature}`);
    console.log(`Slot: ${result.slot}`);
    console.log(`Timestamp: ${result.timestamp} (${new Date(result.timestamp * 1000).toISOString()})`);
    console.log(`Status: ${result.txStatus}`);
    console.log(`Signer: ${result.signer.join(', ')}`);
    console.log(`Compute Units: ${result.computeUnits}`);
    console.log(`Fee: ${result.fee.uiAmount} SOL`);
    if (result.trades.length > 0) {
        console.log('\n--- TRADES ---');
        for (const trade of result.trades) {
            console.log(`\n[Trade ${trade.idx}]`);
            console.log(`  AMM: ${trade.amm}`);
            console.log(`  Type: ${trade.type}`);
            console.log(`  Input: ${trade.inputToken.amount} ${trade.inputToken.mint}`);
            console.log(`  Output: ${trade.outputToken.amount} ${trade.outputToken.mint}`);
            if (trade.user)
                console.log(`  User: ${trade.user}`);
            if (trade.Pool && trade.Pool.length > 0)
                console.log(`  Pool: ${trade.Pool.join(', ')}`);
        }
    }
    if (result.aggregateTrade) {
        console.log('\n--- AGGREGATE TRADE ---');
        const t = result.aggregateTrade;
        console.log(`  AMM: ${t.amm}`);
        console.log(`  Input: ${t.inputToken.amount} ${t.inputToken.mint}`);
        console.log(`  Output: ${t.outputToken.amount} ${t.outputToken.mint}`);
    }
    if (result.liquidities.length > 0) {
        console.log('\n--- LIQUIDITIES ---');
        for (const liq of result.liquidities) {
            console.log(`\n[Liquidity ${liq.idx}]`);
            console.log(`  AMM: ${liq.amm}`);
            console.log(`  Type: ${liq.type}`);
            console.log(`  Pool ID: ${liq.poolId}`);
            if (liq.token0Mint)
                console.log(`  Token0: ${liq.token0Amount} ${liq.token0Mint}`);
            if (liq.token1Mint)
                console.log(`  Token1: ${liq.token1Amount} ${liq.token1Mint}`);
        }
    }
    if (result.memeEvents.length > 0) {
        console.log('\n--- MEME EVENTS ---');
        for (const event of result.memeEvents) {
            console.log(`\n[MemeEvent]`);
            console.log(`  Protocol: ${event.protocol}`);
            console.log(`  Platform: ${event.platform}`);
            console.log(`  Type: ${event.type}`);
            console.log(`  Token: ${event.baseToken?.symbol || event.baseMint || 'N/A'}`);
            if (event.user)
                console.log(`  User: ${event.user}`);
            if (event.poolAddress)
                console.log(`  Pool Address: ${event.poolAddress}`);
            if (event.type === 'CREATE' && event.baseToken) {
                console.log(`  Base Token Mint: ${event.baseToken.mint}`);
                console.log(`  Token Name: ${event.baseToken.name || 'N/A'}`);
                console.log(`  Token Symbol: ${event.baseToken.symbol || 'N/A'}`);
                console.log(`  Token Decimals: ${event.baseToken.decimals}`);
                console.log(`  Token Total Supply: ${event.baseToken.totalSupply}`);
                if (event.baseToken.programId)
                    console.log(`  Token Program: ${event.baseToken.programId}`);
                if (event.quoteToken)
                    console.log(`  Quote Token: ${event.quoteToken.symbol} (${event.quoteToken.mint})`);
                if (event.creatorAddress)
                    console.log(`  Creator: ${event.creatorAddress}`);
                if (event.curveType)
                    console.log(`  Curve Type: ${event.curveType}`);
                if (event.curveQuoteReserves !== undefined)
                    console.log(`  Curve Quote Reserves: ${event.curveQuoteReserves}`);
                if (event.curveBaseReserves !== undefined)
                    console.log(`  Curve Base Reserves: ${event.curveBaseReserves}`);
                if (event.vaultQuoteReserves !== undefined)
                    console.log(`  Vault Quote Reserves: ${event.vaultQuoteReserves}`);
                if (event.vaultBaseReserves !== undefined)
                    console.log(`  Vault Base Reserves: ${event.vaultBaseReserves}`);
                if (event.graduationThreshold !== undefined)
                    console.log(`  Graduation Threshold: ${event.graduationThreshold}`);
                if (event.initialSaleSupply !== undefined)
                    console.log(`  Initial Sale Supply: ${event.initialSaleSupply}`);
                if (event.configAddress)
                    console.log(`  Config Address: ${event.configAddress}`);
            }
            if (event.type === 'BUY' || event.type === 'SELL') {
                if (event.inputToken)
                    console.log(`  Input: ${event.inputToken.amount} ${event.inputToken.mint}`);
                if (event.outputToken)
                    console.log(`  Output: ${event.outputToken.amount} ${event.outputToken.mint}`);
                if (event.fee !== undefined)
                    console.log(`  Fee: ${event.fee}`);
                if (event.vaultQuoteReserves !== undefined)
                    console.log(`  Vault Quote Reserves: ${event.vaultQuoteReserves}`);
                if (event.vaultBaseReserves !== undefined)
                    console.log(`  Vault Base Reserves: ${event.vaultBaseReserves}`);
                if (event.curveQuoteReserves !== undefined)
                    console.log(`  Curve Quote Reserves: ${event.curveQuoteReserves}`);
                if (event.curveBaseReserves !== undefined)
                    console.log(`  Curve Base Reserves: ${event.curveBaseReserves}`);
            }
            if (event.type === 'COMPLETE' || event.type === 'MIGRATE') {
                if (event.migratedTokenAmount !== undefined)
                    console.log(`  Migrated Token Amount: ${event.migratedTokenAmount}`);
                if (event.migratedSolAmount !== undefined)
                    console.log(`  Migrated SOL Amount: ${event.migratedSolAmount}`);
                if (event.migrationFee !== undefined)
                    console.log(`  Migration Fee: ${event.migrationFee}`);
            }
        }
    }
    if (result.transfers.length > 0) {
        console.log('\n--- TRANSFERS ---');
        for (const transfer of result.transfers.slice(0, 10)) {
            console.log(`  ${transfer.type}: ${transfer.info.tokenAmount.uiAmount} ${transfer.info.mint} (${transfer.info.source} -> ${transfer.info.destination})`);
        }
        if (result.transfers.length > 10) {
            console.log(`  ... and ${result.transfers.length - 10} more transfers`);
        }
    }
    if (result.solBalanceChange !== undefined) {
        console.log(`\nSOL Balance Change: ${result.solBalanceChange.change.uiAmount}`);
    }
    if (result.tokenBalanceChange && result.tokenBalanceChange.size > 0) {
        console.log('\nToken Balance Changes:');
        for (const [mint, change] of result.tokenBalanceChange) {
            console.log(`  ${mint}: ${change.change.uiAmount} (decimals: ${change.change.decimals})`);
        }
    }
    if (!result.state) {
        console.log(`\nParse Error: ${result.msg}`);
    }
    console.log('\n' + '='.repeat(80));
    console.log('RAW JSON OUTPUT');
    console.log('='.repeat(80));
    // Convert Map to object for JSON serialization
    const jsonResult = {
        ...result,
        tokenBalanceChange: result.tokenBalanceChange ? Object.fromEntries(result.tokenBalanceChange) : undefined,
    };
    console.log(JSON.stringify(jsonResult, null, 2));
}
// Helper to read input from stdin
async function prompt(question) {
    const readline = await Promise.resolve().then(() => __importStar(require('readline')));
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
// Main
async function main() {
    let signature = process.argv[2];
    if (!signature) {
        signature = await prompt('Enter signature: ');
        if (!signature) {
            console.error('No signature provided');
            process.exit(1);
        }
    }
    await parseSignature(signature);
}
main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
//# sourceMappingURL=parse-signature.js.map