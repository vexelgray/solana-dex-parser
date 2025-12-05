# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript library for parsing Solana DEX swap transactions. Parses trades, liquidity events, transfers, and meme token events from on-chain transactions across 30+ DEX protocols.

## Build & Test Commands

```bash
yarn install        # Install dependencies
yarn build          # Compile TypeScript to dist/
yarn test           # Run all tests with coverage
yarn test parser.test.ts                    # Run specific test file
yarn test liquidity-raydium.test.ts         # Run liquidity tests
yarn lint           # Run ESLint
yarn format         # Format with Prettier
```

## Supported Protocols

### DEX Aggregators & Routers
- **Jupiter** (all versions) - Priority parsing, aggregated trades
- **OKX DEX** - Route aggregator

### Major AMMs
- **PumpSwap** - Pumpfun AMM (trades + liquidity)
- **Raydium V4/CPMM/CL** - Classic AMM, constant product, concentrated liquidity
- **Orca Whirlpool** - Concentrated liquidity pools
- **Meteora DLMM/Pools/DAMM V2** - Dynamic liquidity market maker
- **Sanctum, Phoenix, Lifinity** - LST swaps, order book, proactive market maker

### Meme & Launch Platforms
- **Pumpfun** - Bonding curve (CREATE/TRADE/COMPLETE/MIGRATE events)
- **Raydium Launchpad** - Meme launcher
- **Meteora DBC** - Dynamic bonding curve
- **Moonit, Heaven.xyz, Sugar.money, Bonk, BoopFun** - Meme launchers

### Trading Bots
- BananaGun, Maestro, Nova, Bloom, Mintech, Apepro, Axiom, Padre

## Architecture

### Core Components

**DexParser** (`src/dex-parser.ts`) - Main entry point. Routes transactions to protocol-specific parsers via registry maps:
- `parserMap` - Trade parsers by program ID
- `parseLiquidityMap` - Liquidity event parsers
- `parseMemeEventMap` - Meme token event parsers (CREATE/TRADE/MIGRATE/COMPLETE)
- `parseTransferMap` - Transfer parsers

**TransactionAdapter** (`src/transaction-adapter.ts`) - Unified interface for accessing both parsed (`getParsedTransaction`) and compiled (`getTransaction`) Solana transactions. Handles:
- Account key extraction (static + loaded addresses)
- Token balance lookups (pre/post)
- SPL token info extraction
- Instruction data decoding

**InstructionClassifier** (`src/instruction-classifier.ts`) - Groups all instructions (outer + inner) by program ID for efficient lookup.

### Parser Hierarchy

```
BaseParser (abstract)
├── Trade parsers: processTrades() → TradeInfo[]
└── Protocol-specific: JupiterParser, RaydiumParser, PumpfunParser, etc.

BaseEventParser (abstract)
├── Meme event parsers: processEvents() → MemeEvent[]
└── Protocol-specific: PumpfunEventParser, MeteoraDBCEventParser, etc.

BaseLiquidityParser (abstract)
├── Liquidity parsers: processLiquidity() → PoolEvent[]
└── Protocol-specific: RaydiumV4PoolParser, MeteoraDLMMPoolParser, etc.
```

### Key Types

- `SolanaTransaction` - Union of ParsedTransactionWithMeta | VersionedTransactionResponse
- `TradeInfo` - Complete trade with input/output tokens, fees, AMM info
- `MemeEvent` - Unified event for launchpads (CREATE/TRADE/MIGRATE/COMPLETE)
- `PoolEvent` - Liquidity ADD/REMOVE events
- `TransferData` - Token transfer with balance info
- `ParseResult` - Complete parsing result with trades, liquidities, transfers, memeEvents, balanceChanges

### ParseConfig Options

```typescript
interface ParseConfig {
  tryUnknowDEX?: boolean;      // Try to parse unknown DEX programs (default: true)
  programIds?: string[];        // Only parse specific program IDs
  ignoreProgramIds?: string[];  // Ignore specific program IDs
  aggregateTrades?: boolean;    // Return aggregated trade for Jupiter (default: true)
  throwError?: boolean;         // Throw on parse error (default: false)
}
```

### Protocol Detection

Program IDs defined in `src/constants/programId.ts`. Key patterns:
- Jupiter aggregates trades (returns `aggregateTrade`)
- Other routers (OKX) return multiple trades per AMM hop
- Meme launchpads (PumpFun, Meteora DBC, Raydium LCP) emit lifecycle events
- Most swap records parsed from transfer actions except Jupiter, Pumpfun, Moonit

### Adding New Protocol Support

1. Add program ID to `DEX_PROGRAMS` in `src/constants/programId.ts`
2. Create parser in `src/parsers/{protocol}/`
3. Extend appropriate base class (BaseParser, BaseEventParser, or BaseLiquidityParser)
4. Register in DexParser's parser maps
5. Export from `src/parsers/index.ts`

### Instruction Data Decoding

- `getInstructionData()` - Decode base58 instruction data to Buffer
- `BinaryReader` (`src/parsers/binary-reader.ts`) - Read borsh-encoded fields
- Layout files in `src/parsers/{protocol}/layouts/` - Struct definitions

### Transfer Tracking

Transfers indexed by `{programId}:{outerIndex}[-{innerIndex}]` key pattern. Use `getTransfersForInstruction()` to retrieve transfers for specific instruction.

## Usage Examples

### Basic Trade Parsing
```typescript
import { Connection } from '@solana/web3.js';
import { DexParser } from 'solana-dex-parser';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const tx = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 });

const parser = new DexParser();
const trades = parser.parseTrades(tx);
```

### Parse All (Trades, Liquidity, Transfers, MemeEvents)
```typescript
const result = parser.parseAll(tx);
// result.trades, result.liquidities, result.transfers, result.memeEvents
```

### Direct Event Parser Usage
```typescript
import { PumpfunEventParser, TransactionAdapter } from 'solana-dex-parser';

const eventParser = new PumpfunEventParser(new TransactionAdapter(tx));
const events = eventParser.processEvents(); // MemeEvent[]
```

### Raydium Log Decoding
```typescript
import { decodeRaydiumLog, LogType, parseRaydiumSwapLog } from 'solana-dex-parser';

const log = decodeRaydiumLog("ray_log: ...");
if (log.logType == LogType.SwapBaseIn || log.logType == LogType.SwapBaseOut) {
  const swap = parseRaydiumSwapLog(log);
}
```

## Important Notes

- Jupiter Swap outputs aggregated transaction records
- Other aggregators (e.g., OKX) output multiple swap transaction records per AMM
- Most swap records are parsed from transfer actions except for Jupiter, Pumpfun, and Moonit
- Orca Liquidity analysis: OrcaV1 and OrcaV2 support is limited
- Supports both `getBlock` and `getParsedBlock` for block processing

## Testing

Tests in `src/__tests__/` use real transaction data from test case files (`*.test.case.ts`). Tests require network access to fetch transactions unless using cached data. Test timeout is 30 seconds.

## Environment

- Node.js >= 18.8.0
- TypeScript target: ES2020
- Strict mode enabled
