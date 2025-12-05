# Unified Pool Events - Implementation Workflow

## Overview

Este documento define el workflow de implementación para la especificación `AMM_EVENTS_PROPOSAL.md`, que unifica eventos de **Launchpads** (Pumpfun, Boopfun, etc.) y **AMMs** (PumpSwap, Raydium, Meteora, Orca) en una sola estructura.

---

## Phase 1: Core Types & Infrastructure

### 1.1 Create Unified Type Definitions
**File**: `src/types/pool-events.ts`

**Tasks**:
- [ ] Define `PoolProtocol` type (Launchpads + AMMs)
- [ ] Define `CurveType` type
- [ ] Define `PoolEventType` type
- [ ] Create `BaseTokenInfo` and `QuoteTokenInfo` interfaces
- [ ] Create `UnifiedCreateEvent` interface
- [ ] Create `UnifiedSwapEvent` interface (BUY/SELL)
- [ ] Create `UnifiedAddEvent` interface
- [ ] Create `UnifiedRemoveEvent` interface
- [ ] Create `UnifiedMigrateEvent` interface
- [ ] Create `UnifiedPoolEvent` union type
- [ ] Add type guards (`isCreateEvent`, `isSwapEvent`, etc.)

**Dependencies**: None

**Estimated Complexity**: Medium

```typescript
// Key types to implement:
type PoolProtocol =
  // Launchpads
  | 'Pumpfun' | 'Moonshot' | 'Boopfun' | 'Believe' | 'Boop' | 'Godmode'
  // AMMs
  | 'PumpSwap' | 'MeteoraDamm' | 'MeteoraDammV2' | 'MeteoraDlmm'
  | 'RaydiumCpmm' | 'RaydiumClmm' | 'RaydiumV4' | 'OrcaWhirlpool';

type CurveType = 'ConstantProduct' | 'ConcentratedLiquidity' | 'Exponential' | 'Linear' | 'Stable';

type PoolEventType = 'CREATE' | 'BUY' | 'SELL' | 'ADD' | 'REMOVE' | 'MIGRATE';
```

---

### 1.2 Implement Token Standardization Utilities
**File**: `src/utils/pool-standardization.ts`

**Tasks**:
- [ ] Define `QUOTE_TOKENS` constant set (WSOL, USDC, USDT, USD1)
- [ ] Implement `isQuoteToken()` function
- [ ] Implement `standardizePoolPair()` function
- [ ] Implement `calculateSyntheticReserves()` for CLMM
- [ ] Implement `priceFromSqrtPrice()` for CLMM
- [ ] Add unit tests for all utility functions

**Dependencies**: 1.1

**Estimated Complexity**: Medium

```typescript
// Quote tokens to support:
const QUOTE_TOKENS = new Set([
  'So11111111111111111111111111111111111111112',  // WSOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',  // USD1
]);
```

---

### 1.3 Export Types from Index
**File**: `src/types/index.ts`

**Tasks**:
- [ ] Export all types from `pool-events.ts`
- [ ] Ensure backward compatibility with existing `MemeEvent`

**Dependencies**: 1.1

**Estimated Complexity**: Low

---

## Phase 2: AMM Parsers Implementation

### 2.1 PumpSwap Event Parser (Refactor)
**File**: `src/parsers/pumpfun/parser-pumpswap-event.ts`

**Tasks**:
- [ ] Refactor to emit `UnifiedPoolEvent` format
- [ ] Implement `standardizePoolPair()` for base/quote normalization
- [ ] Handle CREATE, BUY, SELL, ADD (DEPOSIT), REMOVE (WITHDRAW) events
- [ ] Map `isMayhemMode`, `coinCreator`, `coinCreatorFee` fields
- [ ] Add `curveReserves` = `vaultReserves` (same for CP AMMs)
- [ ] Set `curveType: 'ConstantProduct'`

**Dependencies**: 1.1, 1.2

**Estimated Complexity**: Medium

**Mapping Reference**:
| PumpSwap Field | UnifiedEvent Field |
|----------------|-------------------|
| `pool` | `poolAddress` |
| `baseMint` | Standardized `baseMint` |
| `quoteMint` | Standardized `quoteMint` |
| `lpMint` | `lpMint` |
| `lpFeeBasisPoints` | `feeRateBps` |

---

### 2.2 Meteora DAMM V1 Event Parser
**File**: `src/parsers/meteora/parser-meteora-damm-v1-event.ts` (NEW)

**Tasks**:
- [ ] Create new parser for Meteora DAMM V1
- [ ] Parse swap, add_liquidity, remove_liquidity events from logs
- [ ] Implement token standardization (token_a/token_b → base/quote)
- [ ] Handle `curve_type` (0=ConstantProduct, 1=Stable)
- [ ] Map to `UnifiedPoolEvent` format

**Dependencies**: 1.1, 1.2, IDL decoder exists

**Estimated Complexity**: High

---

### 2.3 Meteora DAMM V2 Event Parser
**File**: `src/parsers/meteora/parser-meteora-damm-v2-event.ts` (NEW)

**Tasks**:
- [ ] Create new parser for Meteora DAMM V2 (CLMM-like)
- [ ] Handle `sqrt_price`, `liquidity` fields
- [ ] Parse position NFT events (open_position, add_liquidity, remove_liquidity)
- [ ] Calculate synthetic reserves from `sqrt_price`
- [ ] Set `lpMint: null` (NFT positions)
- [ ] Set `curveType: 'ConcentratedLiquidity'`

**Dependencies**: 1.1, 1.2, IDL decoder exists

**Estimated Complexity**: High

---

### 2.4 Raydium CPMM Event Parser
**File**: `src/parsers/raydium/parser-raydium-cpmm-event.ts` (NEW)

**Tasks**:
- [ ] Create new parser for Raydium CPMM
- [ ] Parse `LpChangeEvent` (deposit/withdraw)
- [ ] Parse `SwapEvent`
- [ ] Implement token standardization (token_0/token_1 → base/quote)
- [ ] Map to `UnifiedPoolEvent` format
- [ ] Set `curveType: 'ConstantProduct'`

**Dependencies**: 1.1, 1.2, IDL exists (`raydium-cpmm.json`)

**Estimated Complexity**: Medium

---

### 2.5 Raydium CLMM Event Parser
**File**: `src/parsers/raydium/parser-raydium-clmm-event.ts` (NEW)

**Tasks**:
- [ ] Create new parser for Raydium CLMM
- [ ] Parse position events (OpenPosition, IncreaseLiquidity, DecreaseLiquidity)
- [ ] Parse Swap events with sqrt_price_limit
- [ ] Handle tick_lower, tick_upper, liquidity_delta
- [ ] Calculate synthetic reserves from `sqrt_price_x64`
- [ ] Set `lpMint: null`, `curveType: 'ConcentratedLiquidity'`

**Dependencies**: 1.1, 1.2, IDL exists (`raydium-clmm.json`)

**Estimated Complexity**: High

---

### 2.6 Raydium Legacy V4 Event Parser
**File**: `src/parsers/raydium/parser-raydium-v4-event.ts` (NEW)

**Tasks**:
- [ ] Create new parser for Raydium Legacy V4
- [ ] Parse explicit events from IDL (Init, Deposit, Withdraw, SwapBaseIn, SwapBaseOut)
- [ ] Handle `direction` field (0=SELL, 1=BUY)
- [ ] Map `coin`/`pc` to base/quote (pc = price currency = quote)
- [ ] Set `curveType: 'ConstantProduct'`

**Dependencies**: 1.1, 1.2, IDL exists (`raydium-amm-v4.json`)

**Estimated Complexity**: Medium

---

### 2.7 Orca Whirlpool Event Parser
**File**: `src/parsers/orca/parser-orca-whirlpool-event.ts` (NEW)

**Tasks**:
- [ ] Fetch/analyze Orca Whirlpool IDL
- [ ] Create parser for CLMM events
- [ ] Handle `sqrt_price`, `tick_current`, position NFTs
- [ ] Implement token standardization (token_a/token_b → base/quote)
- [ ] Set `lpMint: null`, `curveType: 'ConcentratedLiquidity'`

**Dependencies**: 1.1, 1.2, IDL (to be fetched)

**Estimated Complexity**: High

---

## Phase 3: Launchpad Parsers Refactoring

### 3.1 Pumpfun Event Parser (Refactor)
**File**: `src/parsers/pumpfun/parser-pumpfun-event.ts`

**Tasks**:
- [ ] Add option to emit `UnifiedPoolEvent` format
- [ ] Set `launchpad: 'Pumpfun'`, `platform: <from config>`
- [ ] Map `curveReserves` (virtual) vs `vaultReserves` (real)
- [ ] Include `initialSaleSupply`, `graduationThreshold`
- [ ] Set `lpMint: null`, `curveType: 'ConstantProduct'`

**Dependencies**: 1.1, 1.2

**Estimated Complexity**: Low (already well-structured)

---

### 3.2 Boopfun Event Parser (Refactor)
**File**: `src/parsers/boopfun/parser-boopfun-event.ts`

**Tasks**:
- [ ] Add option to emit `UnifiedPoolEvent` format
- [ ] Set `launchpad: 'Boopfun'`
- [ ] Set `curveType: 'Exponential'` (verify from IDL)
- [ ] Map curve/vault reserves

**Dependencies**: 1.1, 1.2

**Estimated Complexity**: Low

---

### 3.3 Meteora DBC Event Parser (Refactor)
**File**: `src/parsers/meteora/parser-meteora-dbc-event.ts`

**Tasks**:
- [ ] Ensure `UnifiedPoolEvent` format compatibility
- [ ] Set `launchpad: 'MeteoraDBC'`
- [ ] Map `curveReserves` (DynamicBondingCurve)
- [ ] Include fee extraction from swap events

**Dependencies**: 1.1, 1.2

**Estimated Complexity**: Low (already refactored)

---

### 3.4 Other Launchpad Parsers
**Files**: `parser-raydium-launchpad-event.ts`, `parser-moonit-event.ts`, `parser-heaven-event.ts`, `parser-sugar-event.ts`

**Tasks**:
- [ ] Audit each parser for `UnifiedPoolEvent` compatibility
- [ ] Add unified output option to each
- [ ] Ensure consistent `launchpad`, `platform`, `curveType` fields

**Dependencies**: 1.1, 1.2

**Estimated Complexity**: Low per parser

---

## Phase 4: IDL Decoders

### 4.1 Create Missing Decoders
**Files**: `src/decoders/`

**Tasks**:
- [ ] Verify `raydium-cpmm-decoder.ts` exists or create
- [ ] Verify `raydium-clmm-decoder.ts` exists or create
- [ ] Create `raydium-v4-decoder.ts`
- [ ] Create `orca-whirlpool-decoder.ts` (pending IDL)
- [ ] Create `meteora-damm-v1-decoder.ts`

**Dependencies**: IDL files in `src/idls/`

**Estimated Complexity**: Medium per decoder

---

### 4.2 Update Decoder Index
**File**: `src/decoders/index.ts`

**Tasks**:
- [ ] Export all new decoders
- [ ] Add `getDecoder(protocol: PoolProtocol)` factory function

**Dependencies**: 4.1

**Estimated Complexity**: Low

---

## Phase 5: Integration & Testing

### 5.1 Create Unified Parser Factory
**File**: `src/parsers/pool-event-parser.ts` (NEW)

**Tasks**:
- [ ] Create factory function to get parser by protocol
- [ ] Implement `parsePoolEvent(tx, protocol)` main entry point
- [ ] Handle automatic protocol detection from program IDs
- [ ] Return `UnifiedPoolEvent` format

**Dependencies**: 2.x, 3.x

**Estimated Complexity**: Medium

```typescript
// API design:
function parsePoolEvents(
  tx: ParsedTransactionWithMeta,
  options?: { protocols?: PoolProtocol[] }
): UnifiedPoolEvent[];
```

---

### 5.2 Add Program ID Constants
**File**: `src/constants/programId.ts`

**Tasks**:
- [ ] Add missing AMM program IDs:
  - Raydium CPMM: `CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C`
  - Raydium CLMM: `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK`
  - Raydium V4: `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8`
  - Orca Whirlpool: `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc`
  - Meteora DAMM V1: `Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB`
- [ ] Create `PROTOCOL_TO_PROGRAM` mapping

**Dependencies**: None

**Estimated Complexity**: Low

---

### 5.3 Unit Tests
**File**: `src/__tests__/pool-events.test.ts` (NEW)

**Tasks**:
- [ ] Test `standardizePoolPair()` with various scenarios:
  - Normal order (Token/SOL)
  - Inverted order (SOL/Token)
  - Token/Token pairs
- [ ] Test `calculateSyntheticReserves()` for CLMM
- [ ] Test type guards
- [ ] Test each parser with sample transactions

**Dependencies**: 1.x, 2.x, 3.x

**Estimated Complexity**: Medium

---

### 5.4 Integration Tests
**File**: `src/__tests__/pool-events-integration.test.ts` (NEW)

**Tasks**:
- [ ] Test real transaction parsing for each protocol
- [ ] Verify output matches `UnifiedPoolEvent` schema
- [ ] Test edge cases (inverted pairs, CLMM positions, etc.)

**Dependencies**: 5.1

**Estimated Complexity**: Medium

---

## Phase 6: Documentation & Export

### 6.1 Update Package Exports
**File**: `index.ts`

**Tasks**:
- [ ] Export `UnifiedPoolEvent` and related types
- [ ] Export `parsePoolEvents()` function
- [ ] Export utility functions

**Dependencies**: 5.1

**Estimated Complexity**: Low

---

### 6.2 Update README
**File**: `README.md`

**Tasks**:
- [ ] Document new unified event structure
- [ ] Add usage examples for AMM parsing
- [ ] Document supported protocols

**Dependencies**: 6.1

**Estimated Complexity**: Low

---

## Implementation Order (Recommended)

```
Week 1: Core Infrastructure
├── 1.1 Type Definitions ─────────────────────┐
├── 1.2 Standardization Utilities ────────────┼──▶ Foundation complete
└── 1.3 Export Types ─────────────────────────┘

Week 2: First AMM Parser
├── 2.1 PumpSwap Refactor ────────────────────┐
├── 5.2 Program ID Constants ─────────────────┼──▶ First AMM working
└── 5.3 Unit Tests (partial) ─────────────────┘

Week 3: Raydium Parsers
├── 2.4 Raydium CPMM Parser ──────────────────┐
├── 2.5 Raydium CLMM Parser ──────────────────┼──▶ Raydium complete
└── 2.6 Raydium V4 Parser ────────────────────┘

Week 4: Meteora & Orca
├── 2.2 Meteora DAMM V1 Parser ───────────────┐
├── 2.3 Meteora DAMM V2 Parser ───────────────┼──▶ All CP+CLMM AMMs
└── 2.7 Orca Whirlpool Parser ────────────────┘

Week 5: Launchpad Refactoring
├── 3.1 Pumpfun Refactor ─────────────────────┐
├── 3.2 Boopfun Refactor ─────────────────────┼──▶ All Launchpads unified
├── 3.3 Meteora DBC Refactor ─────────────────┤
└── 3.4 Other Launchpads ─────────────────────┘

Week 6: Integration & Release
├── 5.1 Unified Parser Factory ───────────────┐
├── 5.4 Integration Tests ────────────────────┼──▶ Release ready
├── 6.1 Package Exports ──────────────────────┤
└── 6.2 Documentation ────────────────────────┘
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Orca Whirlpool IDL unavailable | High | Use CPI event analysis, fetch from Anchor |
| Breaking changes to existing parsers | Medium | Maintain backward compatibility, add new output mode |
| CLMM synthetic reserves calculation errors | Medium | Thorough testing with known transactions |
| Token standardization edge cases | Low | Comprehensive unit tests, fallback to alphabetical order |

---

## Success Criteria

- [ ] All 14 protocols emit `UnifiedPoolEvent` format
- [ ] `standardizePoolPair()` correctly handles inverted pairs
- [ ] Unit test coverage > 80%
- [ ] Integration tests pass for all protocols
- [ ] Backward compatibility with existing `MemeEvent` consumers
- [ ] Documentation complete

---

## Appendix: File Structure After Implementation

```
src/
├── types/
│   ├── pool-events.ts        # NEW: Unified event types
│   ├── meme.ts               # Existing (kept for backward compat)
│   ├── pumpswap.ts           # Existing
│   └── index.ts              # Updated exports
├── utils/
│   └── pool-standardization.ts # NEW: Token pair utilities
├── parsers/
│   ├── pool-event-parser.ts  # NEW: Unified parser factory
│   ├── pumpfun/
│   │   ├── parser-pumpfun-event.ts      # Refactored
│   │   └── parser-pumpswap-event.ts     # Refactored
│   ├── raydium/
│   │   ├── parser-raydium-launchpad-event.ts  # Refactored
│   │   ├── parser-raydium-cpmm-event.ts       # NEW
│   │   ├── parser-raydium-clmm-event.ts       # NEW
│   │   └── parser-raydium-v4-event.ts         # NEW
│   ├── meteora/
│   │   ├── parser-meteora-dbc-event.ts        # Refactored
│   │   ├── parser-meteora-damm-v1-event.ts    # NEW
│   │   └── parser-meteora-damm-v2-event.ts    # NEW
│   ├── orca/
│   │   └── parser-orca-whirlpool-event.ts     # NEW
│   ├── boopfun/
│   │   └── parser-boopfun-event.ts            # Refactored
│   └── ...
├── decoders/
│   ├── raydium-cpmm-decoder.ts     # NEW or verify
│   ├── raydium-clmm-decoder.ts     # NEW or verify
│   ├── raydium-v4-decoder.ts       # NEW
│   ├── orca-whirlpool-decoder.ts   # NEW
│   └── meteora-damm-v1-decoder.ts  # NEW
├── constants/
│   └── programId.ts          # Updated with AMM program IDs
└── __tests__/
    ├── pool-events.test.ts              # NEW
    └── pool-events-integration.test.ts  # NEW
```
