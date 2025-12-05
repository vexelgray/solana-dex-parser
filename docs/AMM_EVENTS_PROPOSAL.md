# Unified Pool Events Specification

## Objetivo

Definir una estructura **unificada** para todos los eventos de pools de liquidez, incluyendo tanto **Launchpads** (Pumpfun, Boopfun, Moonshot, etc.) como **AMMs tradicionales** (PumpSwap, Raydium, Orca, Meteora, etc.).

Esta especificación permite:
- Un solo esquema de base de datos para todos los eventos
- ETL simplificado con una estructura común
- Queries consistentes independientemente del protocolo
- Compatibilidad hacia atrás con la estructura existente de MemeEvent

Este documento está basado en el análisis detallado de todos los IDLs disponibles y la estructura existente de `MemeEvent`.

---

## Análisis de IDLs

### Resumen de Protocolos Analizados

| Protocolo | Tipo | Instrucciones | Eventos | Modelo de Liquidez |
|-----------|------|---------------|---------|-------------------|
| **PumpSwap** | Constant Product | 21 | 19 | LP Tokens (fungible) |
| **Meteora DAMM V1** | Constant Product | 26 | 18 | LP Tokens (fungible) |
| **Meteora DAMM V2** | CLMM-like | 30 | 25 | NFT Positions |
| **Raydium CPMM** | Constant Product | 10 | 2 | LP Tokens (fungible) |
| **Raydium CLMM** | Concentrated Liquidity | 25 | 11 | NFT Positions |
| **Raydium Legacy V4** | Constant Product | 16 | 5 | LP Tokens (fungible) |
| **Meteora Dynamic Vault** | ❌ NO ES AMM | 14 | 0 | N/A (Yield Vault) |

### Nomenclatura de Tokens por Protocolo

| Protocolo | Token A | Token B | Notas |
|-----------|---------|---------|-------|
| **PumpSwap** | `base` | `quote` | ⚠️ Orden NO garantizado (ver sección "Reordenamiento") |
| **Meteora DAMM V1/V2** | `token_a` | `token_b` | Orden arbitrario |
| **Raydium CPMM** | `token_0` | `token_1` | Orden por mint address |
| **Raydium CLMM** | `token_0` | `token_1` | Orden por mint address |
| **Raydium V4** | `coin` | `pc` | pc = "price currency" (quote) |

> ⚠️ **IMPORTANTE**: Se ha detectado que en PumpSwap es posible crear pools donde `baseMint` es SOL y `quoteMint` es el Token (inverso al estándar). Ver sección "Determinación de base/quote" para la lógica de reordenamiento.

### Dos Modelos de AMM

#### 1. Constant Product AMM (x * y = k)
- **Protocolos**: PumpSwap, Meteora DAMM V1, Raydium CPMM, Raydium V4
- **Liquidez**: LP Tokens fungibles (ERC-20 style)
- **Precio**: Determinado por ratio de reservas
- **Características**:
  - Liquidez distribuida uniformemente en todo el rango de precios
  - Un solo pool = un solo LP mint
  - ADD/REMOVE afectan todo el rango

#### 2. Concentrated Liquidity (CLMM)
- **Protocolos**: Raydium CLMM, Meteora DAMM V2
- **Liquidez**: NFT Positions (cada posición es única)
- **Precio**: Usa `sqrt_price` (Q64.64 fixed-point)
- **Características**:
  - Liquidez concentrada en rangos de precio específicos
  - Cada posición tiene `tick_lower` y `tick_upper`
  - Liquidez expresada como `u128`
  - Múltiples posiciones por usuario

---

## Análisis Detallado por Protocolo

### 1. PumpSwap

**Program ID**: `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`

#### Instrucciones Principales
```
create_pool          - Crear pool (puede ser desde migración o independiente)
buy                  - Comprar base con quote
sell                 - Vender base por quote
deposit              - Añadir liquidez (ambos tokens)
withdraw             - Quitar liquidez (quemar LP)
```

#### Eventos (del decoder)
```typescript
// CREATE
{
  timestamp: i64,
  index: u16,
  creator: Pubkey,
  baseMint: Pubkey,
  quoteMint: Pubkey,
  baseMintDecimals: u8,
  quoteMintDecimals: u8,
  baseAmountIn: u64,
  quoteAmountIn: u64,
  poolBaseAmount: u64,
  poolQuoteAmount: u64,
  minimumLiquidity: u64,
  lpMint: Pubkey,
  lpTokenAmountOut: u64,
  pool: Pubkey,
  lpMintDecimals: u8
}

// BUY
{
  timestamp: i64,
  baseMint: Pubkey,
  quoteMint: Pubkey,
  baseAmountOut: u64,
  quoteAmountIn: u64,
  poolBaseTokenReserves: u64,
  poolQuoteTokenReserves: u64,
  quoteAmountInWithoutLpFee: u64,
  lpFee: u64,
  lpFeeBasisPoints: u64,
  protocolFee: u64,
  protocolFeeBasisPoints: u64,
  coinCreatorFee: u64,
  coinCreatorFeeBasisPoints: u64,
  user: Pubkey,
  pool: Pubkey,
  coinCreator: Pubkey,
  timestamp2: i64,   // duplicate
  isMayhemMode: bool
}

// SELL (similar a BUY con baseAmountIn/quoteAmountOut)

// DEPOSIT
{
  timestamp: i64,
  lpMint: Pubkey,
  baseMint: Pubkey,
  quoteMint: Pubkey,
  baseAmountIn: u64,
  quoteAmountIn: u64,
  lpTokenAmountOut: u64,
  poolBaseTokenReserves: u64,
  poolQuoteTokenReserves: u64,
  lpMintSupply: u64,
  user: Pubkey,
  pool: Pubkey
}

// WITHDRAW
{
  timestamp: i64,
  lpMint: Pubkey,
  baseMint: Pubkey,
  quoteMint: Pubkey,
  lpTokenAmountIn: u64,
  baseAmountOut: u64,
  quoteAmountOut: u64,
  poolBaseTokenReserves: u64,
  poolQuoteTokenReserves: u64,
  lpMintSupply: u64,
  user: Pubkey,
  pool: Pubkey
}
```

#### Campos Únicos de PumpSwap
- `isMayhemMode`: Modo especial con fees diferentes
- `coinCreator`: Creador original del token (para fee distribution)
- `coinCreatorFee` / `coinCreatorFeeBasisPoints`: Fees al creador

---

### 2. Meteora DAMM V1

**Program ID**: `Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB`

#### Instrucciones Principales
```
initialize_permissionless_pool  - Crear pool con curve_type
swap                            - Intercambio
add_balance_liquidity           - Añadir liquidez balanceada
add_imbalance_liquidity         - Añadir liquidez desbalanceada
remove_balance_liquidity        - Quitar liquidez balanceada
remove_liquidity_single_side    - Quitar un solo token
```

#### Tipos de Curva (curve_type)
```
ConstantProduct = 0  // x * y = k
Stable = 1           // StableSwap (para stablecoins)
```

#### Estructura de Eventos (inferida)
```typescript
// Los eventos usan logs, no tienen estructura explícita en IDL
// Campos comunes inferidos:
{
  pool: Pubkey,
  token_a_mint: Pubkey,
  token_b_mint: Pubkey,
  token_a_amount: u64,
  token_b_amount: u64,
  lp_amount: u64,
  user: Pubkey
}
```

#### Campos Únicos
- `curve_type`: Tipo de curva (0 = ConstantProduct, 1 = Stable)
- `token_a_vault` / `token_b_vault`: Vault accounts para tokens
- Soporta pools con diferentes curvas

---

### 3. Meteora DAMM V2 (CLMM-like)

**Program ID**: Diferente de V1

#### Características CLMM
```typescript
// Usa sqrt_price como CLMM
sqrt_price: u128       // Q64.64 fixed-point
liquidity: u128        // Liquidez total activa

// Posiciones NFT
InitializePoolParameters {
  liquidity: u128,
  sqrt_price: u128,
  activation_point: Option<u64>
}

AddLiquidityParameters {
  liquidity_delta: u128,
  token_a_amount_threshold: u64,
  token_b_amount_threshold: u64
}
```

#### Instrucciones Principales
```
initialize_pool         - Crear pool con sqrt_price inicial
swap                    - Intercambio
open_position           - Abrir posición de liquidez (NFT)
add_liquidity           - Añadir liquidez a posición
remove_liquidity        - Quitar liquidez de posición
close_position          - Cerrar posición NFT
claim_fee               - Reclamar fees acumulados
```

#### Campos Únicos
- `sqrt_price`: Precio como raíz cuadrada (formato Q64.64)
- `liquidity_delta`: Cambio en liquidez (u128)
- Sistema de posiciones NFT (no LP tokens)
- `activation_point`: Punto de activación del pool

---

### 4. Raydium CPMM

**Program ID**: `CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C`

#### Instrucciones
```
initialize    - Crear pool (init_amount_0, init_amount_1, open_time)
deposit       - Añadir liquidez (lp_token_amount, maximum_token_0/1)
withdraw      - Quitar liquidez (lp_token_amount, minimum_token_0/1)
swap_base_input   - Swap con input fijo
swap_base_output  - Swap con output fijo
```

#### Eventos (IDL)
```
LpChangeEvent  - Para deposit/withdraw (sin campos explícitos)
SwapEvent      - Para swaps (sin campos explícitos)
```

#### Estructura de Swap
```typescript
swap_base_input {
  amount_in: u64,
  minimum_amount_out: u64
}

swap_base_output {
  max_amount_in: u64,
  amount_out: u64
}
```

---

### 5. Raydium CLMM

**Program ID**: `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK`

#### Instrucciones Principales
```
create_pool             - sqrt_price_x64, open_time
open_position           - tick_lower_index, tick_upper_index
open_position_with_token_extensions
increase_liquidity      - liquidity: u128, amount_0_max, amount_1_max
decrease_liquidity      - liquidity: u128, amount_0_min, amount_1_min
swap                    - amount, other_amount_threshold, sqrt_price_limit, is_base_input
close_position
```

#### Parámetros de Posición
```typescript
open_position {
  tick_lower_index: i32,    // Tick inferior del rango
  tick_upper_index: i32,    // Tick superior del rango
  tick_array_lower_start_index: i32,
  tick_array_upper_start_index: i32,
  liquidity: u128,
  amount_0_max: u64,
  amount_1_max: u64,
  with_metadata: bool,
  base_flag: Option<bool>
}
```

#### Parámetros de Swap
```typescript
swap {
  amount: u64,
  other_amount_threshold: u64,
  sqrt_price_limit_x64: u128,
  is_base_input: bool
}
```

#### Eventos
```
CreatePool, OpenPosition, IncreaseLiquidity, DecreaseLiquidity,
ClosePosition, Swap, CollectPersonalFee, CollectProtocolFee, etc.
```

---

### 6. Raydium Legacy V4

**Program ID**: `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8`

**ÚNICO**: Este IDL tiene eventos con campos explícitos.

#### Eventos Explícitos
```typescript
// Init
{
  log_type: u8,
  time: u64,
  pc_decimals: u8,
  coin_decimals: u8,
  pc_lot_size: u64,
  coin_lot_size: u64,
  pc_amount: u64,
  coin_amount: u64,
  market: Pubkey
}

// Deposit
{
  log_type: u8,
  max_coin: u64,
  max_pc: u64,
  base: u64,
  pool_coin: u64,
  pool_pc: u64,
  pool_lp: u64,
  calc_pnl_x: u128,
  calc_pnl_y: u128,
  deduct_coin: u64,
  deduct_pc: u64,
  mint_lp: u64
}

// Withdraw
{
  log_type: u8,
  withdraw_lp: u64,
  user_lp: u64,
  pool_coin: u64,
  pool_pc: u64,
  pool_lp: u64,
  calc_pnl_x: u128,
  calc_pnl_y: u128,
  out_coin: u64,
  out_pc: u64
}

// SwapBaseIn
{
  log_type: u8,
  amount_in: u64,
  minimum_out: u64,
  direction: u64,        // 0 = coin->pc, 1 = pc->coin
  user_source: u64,
  pool_coin: u64,
  pool_pc: u64,
  out_amount: u64
}

// SwapBaseOut
{
  log_type: u8,
  max_in: u64,
  amount_out: u64,
  direction: u64,
  user_source: u64,
  pool_coin: u64,
  pool_pc: u64,
  deduct_in: u64
}
```

#### Campos Únicos
- `direction`: u64 (0 = coin→pc, 1 = pc→coin)
- `market`: OpenBook market ID
- `log_type`: Tipo de evento (para deserialización)
- `coin` / `pc`: Nomenclatura histórica (pc = price currency)

---

## Diferencias Clave: Launchpads vs AMMs

| Aspecto | Launchpads (MemeEvent) | AMMs (AmmEvent) |
|---------|------------------------|-----------------|
| **Propósito** | Lanzar nuevos tokens | Trading de tokens existentes |
| **CREATE** | Crea token + bonding curve | Crea pool para tokens existentes |
| **Curva de precio** | Bonding curve (virtual reserves) | Constant Product / CLMM (real reserves) |
| **Graduation** | Migra a AMM al alcanzar threshold | No aplica |
| **LP Tokens** | No hay LP tokens | Sí (fungible o NFT positions) |
| **Fees** | Simples (protocol + creator) | Complejos (LP + protocol + creator) |
| **Rango de liquidez** | Todo el rango (bonding curve) | Todo (CP) o rangos (CLMM) |

---

## Estructura Unificada: Launchpads + AMMs

### Filosofía del Diseño

La estructura unificada permite representar **cualquier tipo de pool** con los mismos campos:

| Concepto | Launchpad | AMM CPMM | AMM CLMM |
|----------|-----------|----------|----------|
| **curveReserves** | Virtuales (bonding curve) | = vaultReserves | Sintéticas (desde sqrtPrice) |
| **vaultReserves** | Tokens reales en custodia | Tokens reales en pool | 0 inicial |
| **lpMint** | null | LP Token address | null (NFT positions) |
| **initialSaleSupply** | Tokens para venta | 0 | 0 |
| **graduationThreshold** | Meta de graduación | 0 | 0 |

### Decisiones de Diseño

1. **Una estructura para todo**: CREATE unificado para Launchpads y AMMs
2. **Campos contextuales**: Campos específicos de Launchpad son 0/null para AMMs y viceversa
3. **Fees como entero**: `feeRateBps` (basis points) evita problemas de punto flotante
4. **Nomenclatura normalizada**: `base/quote` con reordenamiento dinámico
5. **Reservas duales**: `curveReserves` (precio) vs `vaultReserves` (custodia)

### Tipos de Eventos

```typescript
type PoolEventType = 'CREATE' | 'BUY' | 'SELL' | 'ADD' | 'REMOVE' | 'MIGRATE';
```

| Evento | Descripción | Launchpad | CP AMM | CLMM |
|--------|-------------|-----------|--------|------|
| **CREATE** | Crear pool/curva | ✓ | ✓ | ✓ |
| **BUY** | Comprar base con quote | ✓ | ✓ | ✓ |
| **SELL** | Vender base por quote | ✓ | ✓ | ✓ |
| **ADD** | Añadir liquidez | - | ✓ | ✓ |
| **REMOVE** | Quitar liquidez | - | ✓ | ✓ |
| **MIGRATE** | Graduación a AMM | ✓ | - | - |

---

## Estructura: `UnifiedPoolEvent`

### Tipos y Protocolos

```typescript
type PoolProtocol =
  // Launchpads
  | 'Pumpfun'
  | 'Moonshot'
  | 'Boopfun'
  | 'Believe'
  | 'Boop'
  | 'Godmode'
  // AMMs
  | 'PumpSwap'
  | 'MeteoraDamm'
  | 'MeteoraDammV2'
  | 'MeteoraDlmm'
  | 'RaydiumCpmm'
  | 'RaydiumClmm'
  | 'RaydiumV4'
  | 'OrcaWhirlpool';

type CurveType =
  | 'ConstantProduct'        // AMMs tradicionales, Pumpfun
  | 'ConcentratedLiquidity'  // CLMM (Orca, Raydium CLMM)
  | 'Exponential'            // Boopfun, algunos launchpads
  | 'Linear'                 // Casos especiales
  | 'Stable';                // Meteora Stable pools
```

### CREATE Event (Unificado)

```typescript
interface UnifiedCreateEvent {
  // === IDENTIFICACIÓN ===
  protocol: PoolProtocol;
  type: 'CREATE';
  timestamp: number;
  signature: string;
  slot: number;
  idx: string;

  // === PARTICIPANTE ===
  user: string;
  creatorAddress: string;

  // === ACTIVOS ===
  baseToken: {
    mint: string;
    decimals: number;
    // Opcionales - disponibles en Launchpads, pueden ser null en AMMs
    name?: string;
    symbol?: string;
    uri?: string;
    totalSupply?: number;
    programId?: string;
  };
  quoteToken: {
    mint: string;
    decimals: number;
    symbol?: string;           // "SOL", "USDC", etc.
  };

  // === DIRECCIONES ===
  poolAddress: string;
  configAddress?: string;      // Bonding curve address (Launchpads)

  // === CONTEXTO LAUNCHPAD (null/0 para AMMs) ===
  launchpad?: string;          // "Pumpfun", "Boopfun", null para AMMs
  platform?: string;           // "pump.fun", "boop.fun", null para AMMs
  initialSaleSupply: number;   // Tokens disponibles para venta (0 para AMMs)
  graduationThreshold: number; // SOL necesario para graduar (0 para AMMs)

  // === CONTEXTO AMM (null/0 para Launchpads) ===
  lpMint?: string;             // LP token mint (null para CLMM y Launchpads)
  initialLpAmount?: number;    // LP tokens minteados al crear (null para CLMM/Launchpads)
  feeRateBps: number;          // Fee en basis points (ej: 30 = 0.3%)
  tickSpacing?: number;        // Solo para CLMM
  sqrtPrice?: string;          // Solo para CLMM, como string (u128)
  openTime?: number;           // Timestamp de apertura del pool

  // === MECÁNICA DE PRECIO (CURVE) ===
  curveType: CurveType;
  curveBaseReserves: number;   // Virtual (Launchpad) / Real (CPMM) / Sintético (CLMM)
  curveQuoteReserves: number;  // Virtual (Launchpad) / Real (CPMM) / Sintético (CLMM)

  // === ESTADO DE CUSTODIA (VAULT) ===
  vaultBaseReserves: number;   // Tokens reales en custodia/pool
  vaultQuoteReserves: number;  // Tokens reales en custodia/pool
}
```

### Tabla de Valores por Protocolo (CREATE)

| Campo | Pumpfun | Boopfun | PumpSwap | Raydium CPMM | Raydium CLMM | Orca |
|-------|---------|---------|----------|--------------|--------------|------|
| `launchpad` | "Pumpfun" | "Boopfun" | null | null | null | null |
| `platform` | "pump.fun" | "boop.fun" | null | null | null | null |
| `lpMint` | null | null | ✓ | ✓ | null | null |
| `feeRateBps` | 100 | ? | 25 | 25 | variable | variable |
| `tickSpacing` | null | null | null | null | ✓ | ✓ |
| `sqrtPrice` | null | null | null | null | ✓ | ✓ |
| `curveType` | ConstantProduct | Exponential | ConstantProduct | ConstantProduct | ConcentratedLiquidity | ConcentratedLiquidity |
| `curveReserves` | Virtual | Virtual | = vault | = vault | Sintético | Sintético |
| `vaultReserves` | Real | Real | = curve | = curve | 0 inicial | 0 inicial |
| `initialSaleSupply` | ✓ | ✓ | 0 | 0 | 0 | 0 |
| `graduationThreshold` | ✓ | ✓ | 0 | 0 | 0 | 0 |
| `baseToken.name/symbol` | ✓ | ✓ | lookup | lookup | lookup | lookup |

### Cálculo de curveReserves para CLMM

Para CLMMs, las reservas "sintéticas" se calculan desde `sqrtPrice` para representar el precio inicial:

```typescript
function calculateSyntheticReserves(
  sqrtPriceX64: string,
  baseDecimals: number,
  quoteDecimals: number
): { curveBaseReserves: number; curveQuoteReserves: number } {
  // sqrtPrice está en formato Q64.64
  const sqrtPriceFloat = Number(BigInt(sqrtPriceX64)) / (2 ** 64);
  const price = sqrtPriceFloat ** 2;

  // Ajustar por diferencia de decimales
  const decimalAdjustment = 10 ** (quoteDecimals - baseDecimals);
  const adjustedPrice = price * decimalAdjustment;

  // Usar 1 unidad de quote como referencia
  const referenceQuote = 10 ** quoteDecimals; // 1 SOL = 1e9 lamports

  return {
    curveQuoteReserves: referenceQuote,
    curveBaseReserves: Math.floor(referenceQuote / adjustedPrice),
  };
}
```

---

### BUY/SELL Event (Unificado)

```typescript
interface UnifiedSwapEvent {
  // === IDENTIFICACIÓN ===
  protocol: PoolProtocol;
  type: 'BUY' | 'SELL';        // BUY = quote→base, SELL = base→quote
  timestamp: number;
  signature: string;
  slot: number;
  idx: string;

  // === PARTICIPANTE ===
  user: string;

  // === ACTIVOS ===
  baseToken: {
    mint: string;
    decimals: number;
    symbol?: string;
  };
  quoteToken: {
    mint: string;
    decimals: number;
    symbol?: string;
  };

  // === DIRECCIONES ===
  poolAddress: string;

  // === CONTEXTO LAUNCHPAD ===
  launchpad?: string;
  platform?: string;

  // === AMOUNTS ===
  baseAmount: number;          // Tokens base (comprados o vendidos)
  quoteAmount: number;         // Tokens quote (pagados o recibidos)

  // === ESTADO DESPUÉS DEL SWAP ===
  // Para Launchpads: curveReserves = bonding curve virtual
  // Para AMMs: curveReserves = vaultReserves = reservas reales
  curveBaseReserves: number;
  curveQuoteReserves: number;
  vaultBaseReserves: number;
  vaultQuoteReserves: number;

  // === FEES ===
  lpFee: number;               // Fee que va a LPs (0 para Launchpads)
  lpFeeBps: number;
  protocolFee: number;         // Fee al protocolo
  protocolFeeBps: number;
  creatorFee?: number;         // Fee al creador (PumpSwap, algunos Launchpads)
  creatorFeeBps?: number;
  totalFee: number;

  // === PROTOCOL SPECIFIC ===
  coinCreator?: string;        // PumpSwap
  isMayhemMode?: boolean;      // PumpSwap

  // === CLMM SPECIFIC ===
  sqrtPriceAfter?: string;     // sqrt_price después del swap
  tickAfter?: number;          // Tick activo después del swap
}
```

---

### ADD Event (Añadir Liquidez)

```typescript
interface UnifiedAddEvent {
  // === IDENTIFICACIÓN ===
  protocol: PoolProtocol;
  type: 'ADD';
  timestamp: number;
  signature: string;
  slot: number;
  idx: string;

  // === PARTICIPANTE ===
  user: string;

  // === ACTIVOS ===
  baseToken: { mint: string; decimals: number; symbol?: string; };
  quoteToken: { mint: string; decimals: number; symbol?: string; };

  // === DIRECCIONES ===
  poolAddress: string;

  // === TOKENS DEPOSITADOS ===
  baseAmountIn: number;
  quoteAmountIn: number;

  // === LP TOKENS (CP AMM) ===
  lpMint?: string;
  lpAmount?: number;           // LP tokens recibidos

  // === ESTADO DESPUÉS ===
  curveBaseReserves: number;
  curveQuoteReserves: number;
  vaultBaseReserves: number;
  vaultQuoteReserves: number;
  lpTotalSupply?: number;      // Solo CP AMMs

  // === CLMM SPECIFIC ===
  positionAddress?: string;    // NFT position address
  liquidityDelta?: string;     // Cambio en liquidez (u128)
  tickLower?: number;          // Tick inferior del rango
  tickUpper?: number;          // Tick superior del rango
}
```

---

### REMOVE Event (Quitar Liquidez)

```typescript
interface UnifiedRemoveEvent {
  // === IDENTIFICACIÓN ===
  protocol: PoolProtocol;
  type: 'REMOVE';
  timestamp: number;
  signature: string;
  slot: number;
  idx: string;

  // === PARTICIPANTE ===
  user: string;

  // === ACTIVOS ===
  baseToken: { mint: string; decimals: number; symbol?: string; };
  quoteToken: { mint: string; decimals: number; symbol?: string; };

  // === DIRECCIONES ===
  poolAddress: string;

  // === LP TOKENS QUEMADOS (CP AMM) ===
  lpMint?: string;
  lpAmountIn?: number;

  // === TOKENS RECIBIDOS ===
  baseAmountOut: number;
  quoteAmountOut: number;

  // === ESTADO DESPUÉS ===
  curveBaseReserves: number;
  curveQuoteReserves: number;
  vaultBaseReserves: number;
  vaultQuoteReserves: number;
  lpTotalSupply?: number;

  // === CLMM SPECIFIC ===
  positionAddress?: string;
  liquidityDelta?: string;
  tickLower?: number;
  tickUpper?: number;
  positionClosed?: boolean;    // Si la posición fue cerrada completamente
}
```

---

### MIGRATE Event (Graduación)

```typescript
interface UnifiedMigrateEvent {
  // === IDENTIFICACIÓN ===
  protocol: PoolProtocol;      // Launchpad de origen
  type: 'MIGRATE';
  timestamp: number;
  signature: string;
  slot: number;
  idx: string;

  // === PARTICIPANTE ===
  user: string;                // Puede ser el sistema

  // === ACTIVOS ===
  baseToken: { mint: string; decimals: number; symbol?: string; };
  quoteToken: { mint: string; decimals: number; symbol?: string; };

  // === DIRECCIONES ===
  poolAddress: string;         // Bonding curve original
  targetPoolAddress: string;   // Pool AMM destino (PumpSwap, Raydium, etc.)
  targetProtocol: PoolProtocol; // "PumpSwap", "RaydiumCpmm", etc.

  // === AMOUNTS MIGRADOS ===
  migratedBaseAmount: number;
  migratedQuoteAmount: number;
  migrationFee?: number;       // Fee cobrado en la migración

  // === LP TOKENS GENERADOS ===
  lpMint?: string;
  lpAmount?: number;
}
```

---

### Union Type

```typescript
type UnifiedPoolEvent =
  | UnifiedCreateEvent
  | UnifiedSwapEvent
  | UnifiedAddEvent
  | UnifiedRemoveEvent
  | UnifiedMigrateEvent;

// Type guards
function isCreateEvent(event: UnifiedPoolEvent): event is UnifiedCreateEvent {
  return event.type === 'CREATE';
}

function isSwapEvent(event: UnifiedPoolEvent): event is UnifiedSwapEvent {
  return event.type === 'BUY' || event.type === 'SELL';
}

function isLaunchpadEvent(event: UnifiedPoolEvent): boolean {
  return event.launchpad !== undefined && event.launchpad !== null;
}

function isClmmEvent(event: UnifiedPoolEvent): boolean {
  return 'sqrtPrice' in event || 'tickLower' in event || 'sqrtPriceAfter' in event;
}
```

---

## Mapping por Protocolo

### PumpSwap → AmmEvent

| PumpSwap Field | AmmEvent Field | Notas |
|----------------|----------------|-------|
| `pool` | `poolAddress` | |
| `baseMint` | `baseMint` | Aplicar reordenamiento |
| `quoteMint` | `quoteMint` | Aplicar reordenamiento |
| `lpMint` | `lpMint` | |
| `creator` | `creator`, `user` | |
| `baseMintDecimals` | `baseDecimals` | |
| `quoteMintDecimals` | `quoteDecimals` | |
| `lpFeeBasisPoints` | `feeRateBps` | CREATE: usar LP fee como fee rate |
| `baseAmountIn` | `initialBaseAmount` | CREATE |
| `quoteAmountIn` | `initialQuoteAmount` | CREATE |
| `lpTokenAmountOut` | `initialLpAmount` / `lpAmount` | |
| `poolBaseAmount/Reserves` | `poolBaseReserves` | |
| `poolQuoteAmount/Reserves` | `poolQuoteReserves` | |
| `index` | `poolIndex` | |
| `lpFee` | `lpFee` | |
| `protocolFee` | `protocolFee` | |
| `coinCreatorFee` | `creatorFee` | |
| `coinCreator` | `coinCreator` | |
| `isMayhemMode` | `isMayhemMode` | |

### Meteora DAMM V1 → AmmEvent

| Meteora Field | AmmEvent Field | Notas |
|---------------|----------------|-------|
| `pool` | `poolAddress` | |
| `token_a_mint` | `baseMint` | Aplicar reordenamiento |
| `token_b_mint` | `quoteMint` | Aplicar reordenamiento |
| `trade_fee_bps` | `feeRateBps` | Del pool state |
| `token_a_amount` | Depende del evento | Aplicar reordenamiento |
| `token_b_amount` | Depende del evento | Aplicar reordenamiento |
| `lp_mint` | `lpMint` | |
| `lp_amount` | `lpAmount` | |
| `curve_type` | No mapeado | Info auxiliar (0=CP, 1=Stable) |

### Raydium CPMM → AmmEvent

| Raydium Field | AmmEvent Field | Notas |
|---------------|----------------|-------|
| `pool_state` | `poolAddress` | |
| `token_0_mint` | `baseMint` o `quoteMint` | Aplicar reordenamiento |
| `token_1_mint` | `quoteMint` o `baseMint` | Aplicar reordenamiento |
| `trade_fee_rate` | `feeRateBps` | Del pool config |
| `token_0_vault` | No mapeado | |
| `token_1_vault` | No mapeado | |
| `lp_mint` | `lpMint` | |
| `init_amount_0` | `initialBaseAmount` o `Quote` | Aplicar reordenamiento |
| `init_amount_1` | `initialQuoteAmount` o `Base` | Aplicar reordenamiento |

### Raydium CLMM → AmmEvent

| Raydium CLMM Field | AmmEvent Field | Notas |
|-------------------|----------------|-------|
| `pool_state` | `poolAddress` | |
| `token_mint_0` | `baseMint` | Aplicar reordenamiento |
| `token_mint_1` | `quoteMint` | Aplicar reordenamiento |
| `trade_fee_rate` | `feeRateBps` | Del pool config |
| `tick_spacing` | `tickSpacing` | Define granularidad de liquidez |
| `sqrt_price_x64` | `sqrtPrice` | Como string (u128) |
| `tick_current` | `tickAfter` | Para SWAPs |
| `liquidity` | `liquidityDelta` | Como string (u128) |
| `tick_lower_index` | `tickLower` | |
| `tick_upper_index` | `tickUpper` | |
| `position_nft_mint` | `positionAddress` | |
| N/A | `lpMint` | **NULL** (no existe en CLMM) |
| N/A | `initialBaseAmount` | **0** (liquidez en open_position) |
| N/A | `initialQuoteAmount` | **0** (liquidez en open_position) |

### Raydium V4 → AmmEvent

| Raydium V4 Field | AmmEvent Field | Notas |
|------------------|----------------|-------|
| `amm_id` | `poolAddress` | |
| `coin_mint` | `baseMint` | coin = base (verificar reordenamiento) |
| `pc_mint` | `quoteMint` | pc = quote |
| `trade_fee_numerator/denominator` | `feeRateBps` | Calcular: (num/denom) * 10000 |
| `lp_mint` | `lpMint` | |
| `coin_amount` | `baseAmount` o reserves | |
| `pc_amount` | `quoteAmount` o reserves | |
| `pool_coin` | `poolBaseReserves` | |
| `pool_pc` | `poolQuoteReserves` | |
| `pool_lp` | `lpTotalSupply` | |
| `direction` | `direction` | 0=SELL (coin→pc), 1=BUY (pc→coin) |
| `market` | No mapeado | OpenBook market ID |

---

## Determinación de base/quote

### Problema: Orden Invertido en PumpSwap

Se ha detectado que en PumpSwap es posible crear pools donde `baseMint` es SOL y `quoteMint` es el Token (inverso al estándar esperado).

**Ejemplo real** (signature: `38CEiexmGZvER4LzyQbGsDMVbVocUkiBoM5zSb4HM9hJ...`):
```typescript
{
  baseMint: "So11111111111111111111111111111111111111112",   // SOL como base!
  quoteMint: "Fc3zkPijH6jM7Y7Zx8gkcpYv14DwXYi4T1S7tG3PtoXg", // Token como quote!
  baseAmountIn: "70000000000",      // 70 SOL
  quoteAmountIn: "1000000000000000" // 1B tokens
}
```

### Solución: Reordenamiento Dinámico

Para mantener consistencia en la base de datos (`base` = Token, `quote` = SOL/USDC), se debe implementar una lógica de **reordenamiento dinámico**.

#### Quote Tokens Conocidos

```typescript
const QUOTE_TOKENS = new Set([
  'So11111111111111111111111111111111111111112',  // WSOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',  // USD1
]);

function isQuoteToken(mint: string): boolean {
  return QUOTE_TOKENS.has(mint);
}
```

#### Función de Estandarización

```typescript
interface PoolPair {
  baseMint: string;
  quoteMint: string;
  baseDecimals: number;
  quoteDecimals: number;
  baseAmount: bigint;
  quoteAmount: bigint;
}

interface StandardizedPair extends PoolPair {
  wasSwapped: boolean;  // True si se intercambió el orden
}

function standardizePoolPair(original: PoolPair): StandardizedPair {
  // Si el baseMint original es un quote token conocido -> INTERCAMBIAR
  if (isQuoteToken(original.baseMint)) {
    return {
      baseMint: original.quoteMint,      // Token pasa a ser base
      quoteMint: original.baseMint,      // SOL/USDC pasa a ser quote
      baseDecimals: original.quoteDecimals,
      quoteDecimals: original.baseDecimals,
      baseAmount: original.quoteAmount,   // Intercambiar montos
      quoteAmount: original.baseAmount,
      wasSwapped: true,
    };
  }

  // Si el quoteMint es un quote token conocido -> orden correcto
  if (isQuoteToken(original.quoteMint)) {
    return {
      ...original,
      wasSwapped: false,
    };
  }

  // Ninguno es quote token conocido -> usar orden alfabético
  if (original.baseMint > original.quoteMint) {
    return {
      baseMint: original.quoteMint,
      quoteMint: original.baseMint,
      baseDecimals: original.quoteDecimals,
      quoteDecimals: original.baseDecimals,
      baseAmount: original.quoteAmount,
      quoteAmount: original.baseAmount,
      wasSwapped: true,
    };
  }

  return {
    ...original,
    wasSwapped: false,
  };
}
```

#### Aplicación por Tipo de Evento

##### CREATE Event
```typescript
function normalizeCreateEvent(raw: PumpswapCreatePoolEvent): AmmCreateEvent {
  const standardized = standardizePoolPair({
    baseMint: raw.baseMint,
    quoteMint: raw.quoteMint,
    baseDecimals: raw.baseMintDecimals,
    quoteDecimals: raw.quoteMintDecimals,
    baseAmount: BigInt(raw.baseAmountIn),
    quoteAmount: BigInt(raw.quoteAmountIn),
  });

  return {
    type: 'CREATE',
    baseMint: standardized.baseMint,
    quoteMint: standardized.quoteMint,
    baseDecimals: standardized.baseDecimals,
    quoteDecimals: standardized.quoteDecimals,
    initialBaseAmount: toUiAmount(standardized.baseAmount, standardized.baseDecimals),
    initialQuoteAmount: toUiAmount(standardized.quoteAmount, standardized.quoteDecimals),
    poolBaseReserves: toUiAmount(
      standardized.wasSwapped ? BigInt(raw.poolQuoteAmount) : BigInt(raw.poolBaseAmount),
      standardized.baseDecimals
    ),
    poolQuoteReserves: toUiAmount(
      standardized.wasSwapped ? BigInt(raw.poolBaseAmount) : BigInt(raw.poolQuoteAmount),
      standardized.quoteDecimals
    ),
    // ... resto de campos
  };
}
```

##### SWAP Event (BUY/SELL)
```typescript
function normalizeSwapEvent(raw: PumpswapBuyEvent | PumpswapSellEvent): AmmSwapEvent {
  const isBuyEvent = 'baseAmountOut' in raw;

  const standardized = standardizePoolPair({
    baseMint: raw.baseMint,
    quoteMint: raw.quoteMint,
    baseDecimals: raw.baseMintDecimals,  // Puede necesitar lookup
    quoteDecimals: raw.quoteMintDecimals,
    baseAmount: BigInt(isBuyEvent ? raw.baseAmountOut : raw.baseAmountIn),
    quoteAmount: BigInt(isBuyEvent ? raw.quoteAmountIn : raw.quoteAmountOut),
  });

  // Determinar dirección después de estandarización
  // Si wasSwapped, la dirección se invierte
  let direction: 'BUY' | 'SELL';
  if (standardized.wasSwapped) {
    direction = isBuyEvent ? 'SELL' : 'BUY';  // Invertido
  } else {
    direction = isBuyEvent ? 'BUY' : 'SELL';  // Normal
  }

  return {
    type: 'SWAP',
    direction,
    baseMint: standardized.baseMint,
    quoteMint: standardized.quoteMint,
    baseAmount: toUiAmount(standardized.baseAmount, standardized.baseDecimals),
    quoteAmount: toUiAmount(standardized.quoteAmount, standardized.quoteDecimals),
    poolBaseReserves: toUiAmount(
      standardized.wasSwapped
        ? BigInt(raw.poolQuoteTokenReserves)
        : BigInt(raw.poolBaseTokenReserves),
      standardized.baseDecimals
    ),
    poolQuoteReserves: toUiAmount(
      standardized.wasSwapped
        ? BigInt(raw.poolBaseTokenReserves)
        : BigInt(raw.poolQuoteTokenReserves),
      standardized.quoteDecimals
    ),
    // ... resto de campos (fees no cambian)
  };
}
```

##### ADD/REMOVE Events
```typescript
// Misma lógica: intercambiar baseAmountIn/Out con quoteAmountIn/Out si wasSwapped
```

### Tabla de Intercambio por Campo

| Campo Original | Si `wasSwapped = true` |
|----------------|------------------------|
| `baseMint` | → `quoteMint` |
| `quoteMint` | → `baseMint` |
| `baseDecimals` | → `quoteDecimals` |
| `quoteDecimals` | → `baseDecimals` |
| `baseAmountIn/Out` | → `quoteAmountIn/Out` |
| `quoteAmountIn/Out` | → `baseAmountIn/Out` |
| `poolBaseReserves` | → `poolQuoteReserves` |
| `poolQuoteReserves` | → `poolBaseReserves` |
| BUY event | → SELL (dirección invertida) |
| SELL event | → BUY (dirección invertida) |

### Campos que NO cambian

- `lpFee`, `protocolFee`, `creatorFee` (fees son en quote token, se mantienen)
- `lpMint`, `lpAmount`, `lpTotalSupply`
- `user`, `pool`, `coinCreator`
- `isMayhemMode`, `timestamp`, etc.

### Aplicación a Otros Protocolos

Esta misma lógica debe aplicarse a **todos los protocolos** donde el orden de tokens no está garantizado:

| Protocolo | ¿Necesita reordenamiento? | Notas |
|-----------|--------------------------|-------|
| **PumpSwap** | ✅ Sí | Detectado orden invertido |
| **Meteora DAMM V1/V2** | ✅ Sí | `token_a/b` orden arbitrario |
| **Raydium CPMM** | ✅ Sí | `token_0/1` por address |
| **Raydium CLMM** | ✅ Sí | `token_0/1` por address |
| **Raydium V4** | ⚠️ Verificar | `coin/pc` debería ser correcto |
| **Orca Whirlpool** | ✅ Sí | `token_a/b` orden arbitrario |

---

## Consideraciones para ETL

### Esquema de Base de Datos (Unificado)

```sql
-- Tabla unificada de eventos de pools (Launchpads + AMMs)
CREATE TABLE pool_events (
  -- === IDENTIFICACIÓN ===
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL,           -- 'CREATE', 'BUY', 'SELL', 'ADD', 'REMOVE', 'MIGRATE'
  protocol VARCHAR(20) NOT NULL,       -- 'Pumpfun', 'PumpSwap', 'RaydiumClmm', etc.
  slot BIGINT NOT NULL,
  timestamp BIGINT NOT NULL,
  signature VARCHAR(88) NOT NULL,
  idx VARCHAR(20) NOT NULL,

  -- === PARTICIPANTE ===
  "user" VARCHAR(44) NOT NULL,
  creator_address VARCHAR(44),         -- CREATE events

  -- === ACTIVOS ===
  base_mint VARCHAR(44) NOT NULL,
  base_decimals SMALLINT NOT NULL,
  base_name VARCHAR(100),              -- Disponible en Launchpads
  base_symbol VARCHAR(20),             -- Disponible en Launchpads
  base_uri TEXT,                       -- Disponible en Launchpads
  base_total_supply NUMERIC(30, 0),    -- Disponible en Launchpads

  quote_mint VARCHAR(44) NOT NULL,
  quote_decimals SMALLINT NOT NULL,
  quote_symbol VARCHAR(10),            -- 'SOL', 'USDC', etc.

  -- === DIRECCIONES ===
  pool_address VARCHAR(44) NOT NULL,
  config_address VARCHAR(44),          -- Bonding curve (Launchpads)

  -- === CONTEXTO LAUNCHPAD ===
  launchpad VARCHAR(20),               -- 'Pumpfun', 'Boopfun', NULL para AMMs
  platform VARCHAR(50),                -- 'pump.fun', 'boop.fun', NULL para AMMs
  initial_sale_supply NUMERIC(30, 0),  -- 0 para AMMs
  graduation_threshold NUMERIC(20, 0), -- 0 para AMMs

  -- === CONTEXTO AMM ===
  lp_mint VARCHAR(44),                 -- NULL para CLMM y Launchpads
  lp_amount NUMERIC(30, 0),            -- LP tokens recibidos/quemados
  lp_total_supply NUMERIC(30, 0),      -- Supply total de LP
  fee_rate_bps INTEGER,                -- Fee en basis points

  -- === AMOUNTS ===
  base_amount NUMERIC(30, 12),         -- Tokens comprados/vendidos/depositados
  quote_amount NUMERIC(30, 12),        -- SOL pagado/recibido

  -- === RESERVAS (CURVE = precio, VAULT = custodia) ===
  curve_base_reserves NUMERIC(30, 12), -- Virtual/Real/Sintético
  curve_quote_reserves NUMERIC(30, 12),
  vault_base_reserves NUMERIC(30, 12), -- Tokens reales en custodia
  vault_quote_reserves NUMERIC(30, 12),

  -- === FEES (BUY/SELL) ===
  lp_fee NUMERIC(20, 12),
  lp_fee_bps INTEGER,
  protocol_fee NUMERIC(20, 12),
  protocol_fee_bps INTEGER,
  creator_fee NUMERIC(20, 12),         -- PumpSwap, algunos Launchpads
  creator_fee_bps INTEGER,
  total_fee NUMERIC(20, 12),

  -- === CLMM SPECIFIC ===
  curve_type VARCHAR(30),              -- 'ConstantProduct', 'ConcentratedLiquidity', etc.
  sqrt_price VARCHAR(40),              -- u128 como string
  tick_spacing INTEGER,
  tick_lower INTEGER,
  tick_upper INTEGER,
  tick_after INTEGER,                  -- Después de swap
  liquidity_delta VARCHAR(40),         -- u128 como string
  position_address VARCHAR(44),        -- NFT position
  position_closed BOOLEAN,
  open_time BIGINT,

  -- === PROTOCOL SPECIFIC ===
  coin_creator VARCHAR(44),            -- PumpSwap
  is_mayhem_mode BOOLEAN,              -- PumpSwap

  -- === MIGRATE SPECIFIC ===
  target_pool_address VARCHAR(44),     -- Pool destino en migración
  target_protocol VARCHAR(20),         -- Protocolo destino
  migrated_base_amount NUMERIC(30, 12),
  migrated_quote_amount NUMERIC(30, 12),
  migration_fee NUMERIC(20, 12),

  -- === METADATA ===
  created_at TIMESTAMP DEFAULT NOW()
);

-- === ÍNDICES ===
CREATE INDEX idx_pool_events_pool ON pool_events(pool_address);
CREATE INDEX idx_pool_events_user ON pool_events("user");
CREATE INDEX idx_pool_events_base ON pool_events(base_mint);
CREATE INDEX idx_pool_events_slot ON pool_events(slot);
CREATE INDEX idx_pool_events_type ON pool_events(type);
CREATE INDEX idx_pool_events_protocol ON pool_events(protocol);
CREATE INDEX idx_pool_events_signature ON pool_events(signature);
CREATE INDEX idx_pool_events_launchpad ON pool_events(launchpad) WHERE launchpad IS NOT NULL;

-- Composite para queries comunes
CREATE INDEX idx_pool_pool_type_slot ON pool_events(pool_address, type, slot);
CREATE INDEX idx_pool_user_slot ON pool_events("user", slot DESC);
CREATE INDEX idx_pool_base_slot ON pool_events(base_mint, slot DESC);
```

### Campos por Tipo de Evento y Protocolo

| Campo | CREATE Launchpad | CREATE AMM CP | CREATE CLMM | BUY/SELL | ADD | REMOVE | MIGRATE |
|-------|------------------|---------------|-------------|----------|-----|--------|---------|
| `launchpad` | ✓ | null | null | ✓/null | null | null | ✓ |
| `lp_mint` | null | ✓ | null | - | ✓/null | ✓/null | ✓ |
| `initial_sale_supply` | ✓ | 0 | 0 | - | - | - | - |
| `graduation_threshold` | ✓ | 0 | 0 | - | - | - | - |
| `curve_reserves` | Virtual | = vault | Sintético | ✓ | ✓ | ✓ | - |
| `vault_reserves` | Real | = curve | 0 inicial | ✓ | ✓ | ✓ | - |
| `sqrt_price` | null | null | ✓ | CLMM | CLMM | - | - |
| `tick_spacing` | null | null | ✓ | - | - | - | - |
| `tick_lower/upper` | - | - | - | - | CLMM | CLMM | - |
| `position_address` | - | - | - | - | CLMM | CLMM | - |
| `target_pool_address` | - | - | - | - | - | - | ✓ |

### Valores Calculados

```typescript
// Precio implícito (para Constant Product y CLMMs desde reservas sintéticas)
const price = curveQuoteReserves / curveBaseReserves;

// Precio desde sqrtPrice (CLMM)
function priceFromSqrtPrice(sqrtPriceX64: string, baseDecimals: number, quoteDecimals: number): number {
  const sqrtPriceFloat = Number(BigInt(sqrtPriceX64)) / (2 ** 64);
  const rawPrice = sqrtPriceFloat ** 2;
  return rawPrice * (10 ** (quoteDecimals - baseDecimals));
}

// TVL aproximado
const tvlQuote = vaultQuoteReserves * 2; // Asumiendo balance 50/50

// Fee total
const totalFee = lpFee + protocolFee + (creatorFee || 0);

// Market Cap (para Launchpads con totalSupply conocido)
const marketCap = (baseToken.totalSupply / (10 ** baseToken.decimals)) * price;

// Progreso de graduación (Launchpads)
const graduationProgress = vaultQuoteReserves / graduationThreshold * 100;
```

### Queries de Ejemplo

```sql
-- Obtener todos los CREATE de un token específico
SELECT * FROM pool_events
WHERE type = 'CREATE' AND base_mint = 'TOKEN_MINT'
ORDER BY slot DESC;

-- Historial de trades de un usuario
SELECT * FROM pool_events
WHERE "user" = 'USER_ADDRESS' AND type IN ('BUY', 'SELL')
ORDER BY slot DESC;

-- Pools de un Launchpad específico
SELECT * FROM pool_events
WHERE type = 'CREATE' AND launchpad = 'Pumpfun'
ORDER BY slot DESC;

-- Volumen por protocolo (últimas 24h)
SELECT protocol,
       COUNT(*) as trades,
       SUM(quote_amount) as volume_quote
FROM pool_events
WHERE type IN ('BUY', 'SELL')
  AND timestamp > EXTRACT(EPOCH FROM NOW() - INTERVAL '24 hours')
GROUP BY protocol;

-- Pools CLMM con liquidez concentrada
SELECT pool_address, base_mint, sqrt_price, tick_spacing
FROM pool_events
WHERE type = 'CREATE' AND curve_type = 'ConcentratedLiquidity';
```

---

## Próximos Pasos

### Completados
1. ✅ Analizar estructura de PumpSwap
2. ✅ Analizar estructuras de Meteora DAMM V1/V2
3. ✅ Analizar estructuras de Raydium CPMM/CLMM/V4
4. ✅ Definir estructura unificada (Launchpads + AMMs)
5. ✅ Documentar lógica de reordenamiento base/quote
6. ✅ Definir esquema SQL unificado

### Pendientes
7. ⬜ Analizar estructura de Orca Whirlpool (pendiente IDL)
8. ⬜ Analizar estructura de Meteora DLMM
9. ⬜ Implementar tipos TypeScript en `/src/types/pool-events.ts`
10. ⬜ Refactorizar parsers existentes para usar estructura unificada
11. ⬜ Implementar función `standardizePoolPair()` global
12. ⬜ Crear tests de normalización
13. ⬜ Documentar edge cases y limitaciones

---

## Notas Adicionales

### Meteora Dynamic Vault

El programa `Meteora Dynamic Vault` analizado **NO es un AMM**. Es un vault de yield farming con:
- Depósitos/retiros de un solo token
- Estrategias de yield (lending, staking)
- No tiene concepto de swaps o pools de trading

Este programa no debe ser incluido en la normalización de AMM events.

### Orca Whirlpool

Pendiente de analizar. Se espera estructura similar a Raydium CLMM:
- Concentrated Liquidity
- NFT Positions
- Ticks y sqrt_price
