# Meme Events Specification

Este documento especifica la estructura de los eventos devueltos por `parser.parseAll(tx).memeEvents` para cada programa soportado.

---

## Arquitectura de Eventos

El parser soporta dos estructuras de eventos para CREATE:

### 1. `MemeEvent` (Legacy)
Estructura plana usada por **Pumpfun** y **Raydium Launchpad** para todos los eventos (CREATE, BUY, SELL, MIGRATE, COMPLETE).

### 2. `UnifiedCreateEvent` (Nueva)
Estructura semántica y agnóstica del protocolo usada por **Meteora DBC** para eventos CREATE:

- **Campos agrupados**: `baseToken`, `quoteToken` en lugar de campos planos
- **Nomenclatura Curve vs Vault**:
  - `curveBaseReserves` / `curveQuoteReserves`: Reservas matemáticas que determinan el precio
  - `vaultBaseReserves` / `vaultQuoteReserves`: Inventario real disponible
- **Campos renombrados**: `platform`, `poolAddress`, `configAddress`, `creatorAddress`

```typescript
// Type union para todos los eventos
type MemeEventResult = MemeEvent | UnifiedCreateEvent;

// Discriminar tipos con type guards (usar baseToken como discriminador)
function isUnifiedCreateEvent(event: MemeEventResult): event is UnifiedCreateEvent {
  return 'baseToken' in event && event.type === 'CREATE';
}
```

---

## Pumpfun

**Program ID:** `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`

### CREATE

Evento emitido cuando se crea un nuevo token en la bonding curve.

```typescript
{
  // Identificación
  protocol: "Pumpfun",
  launchpad: "Pumpfun",
  launchpadPlatform: string,  // "pump.fun" o "pump_mayhem"
  type: "CREATE",
  signature: string,          // Signature de la transacción
  slot: number,               // Slot de la transacción
  timestamp: number,          // Unix timestamp
  idx: string,                // Índice de instrucción (ej: "2-22")

  // Token Info
  baseMint: string,           // Mint address del token creado
  quoteMint: string,          // "So11111111111111111111111111111111111111112" (SOL)
  name: string,               // Nombre del token
  symbol: string,             // Símbolo del token
  uri: string,                // URI de metadata (IPFS)
  decimals: 6,                // Decimales del token (siempre 6)

  // Token Supply
  totalSupply: number,        // Supply total del token (normalizado)
  tokenTotalSupply: number,   // Supply total del token (legacy)

  // Pool Info
  bondingCurve: string,       // Address de la bonding curve
  pool: string,               // Address del pool/bonding curve (= bondingCurve)
  platformConfig: string,     // Configuración de la plataforma (= bondingCurve)
  creator: string,            // Address del creador
  user: string,               // Address del usuario (mismo que creator)

  // Reserves iniciales
  virtualTokenReserves: number,  // Tokens virtuales en la curve
  virtualSolReserves: number,    // SOL virtual en la curve
  realTokenReserves: number,     // Tokens reales en la curve

  // Bonding Curve Config (normalizado)
  curveType: "ConstantProduct",           // Tipo de curva AMM (x * y = k)
  totalQuoteFundRaising: number,          // 85,000,000,000 (85 SOL fijo)
  totalBaseSell: number,                  // Inventario inicial (= realTokenReserves)
  tokenProgram: string,                   // Token program (SPL o Token-2022)
}
```

**Ejemplo real:**
```json
{
  "protocol": "Pumpfun",
  "launchpad": "Pumpfun",
  "launchpadPlatform": "pump.fun",
  "type": "CREATE",
  "timestamp": 1733319609,
  "user": "HePWNgg2tGd9Xp38eqjwAFEp3dwprY2hNVP6ZiUMcaCJ",
  "creator": "HePWNgg2tGd9Xp38eqjwAFEp3dwprY2hNVP6ZiUMcaCJ",
  "baseMint": "26K2jJ8UqPYPhhSvqG1fNVKswUmUdpj7faYHcLdGpump",
  "quoteMint": "So11111111111111111111111111111111111111112",
  "name": "MORI F0X",
  "symbol": "MORI F0X",
  "uri": "https://ipfs.io/ipfs/bafkreicgm6rz7obfvz7pozcxq6mv5ccdwqwd4r7uvl7huklscxnx56x6ta",
  "decimals": 6,
  "totalSupply": 1000000000000000,
  "tokenTotalSupply": 1000000000000000,
  "bondingCurve": "2K9b9Z9kTfn55XF23PieDsLtHbskaxdgijBmTvjNcKaU",
  "pool": "2K9b9Z9kTfn55XF23PieDsLtHbskaxdgijBmTvjNcKaU",
  "platformConfig": "2K9b9Z9kTfn55XF23PieDsLtHbskaxdgijBmTvjNcKaU",
  "virtualTokenReserves": 1073000000000000,
  "virtualSolReserves": 30000000000,
  "realTokenReserves": 793100000000000,
  "curveType": "ConstantProduct",
  "totalQuoteFundRaising": 85000000000,
  "totalBaseSell": 793100000000000,
  "tokenProgram": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  "signature": "4e3bABCdMX59xAFu3V69QYWcDuAPR7ufrBNuwpuoMbK6UsZtE5Ka7izZGusy2f6uWJx8fp8yHzDghXmZux365t9V",
  "slot": 312520349,
  "idx": "0-22"
}
```

---

### BUY

Evento emitido cuando un usuario compra tokens de la bonding curve.

```typescript
{
  // Identificación
  protocol: "Pumpfun",
  type: "BUY",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,           // Mint del token comprado
  quoteMint: string,          // SOL

  // Usuario
  user: string,               // Address del comprador

  // Amounts
  inputToken: {
    mint: string,             // SOL mint
    amountRaw: string,        // Cantidad en lamports (string)
    amount: number,           // Cantidad en SOL (decimal)
    decimals: number,         // 9
  },
  outputToken: {
    mint: string,             // Token mint
    amountRaw: string,        // Cantidad en unidades mínimas
    amount: number,           // Cantidad decimal
    decimals: number,         // Típicamente 6
  },

  // Fees
  fee: number,                // Fee total (puede ser muy grande, verificar)
  creatorFee: number,         // Fee para el creador

  // Estado de la Bonding Curve (post-trade)
  virtualSolReserves: number,
  virtualTokenReserves: number,
  realSolReserves: number,
  realTokenReserves: number,
}
```

**Ejemplo real:**
```json
{
  "protocol": "Pumpfun",
  "launchpad": "Pumpfun",
  "launchpadPlatform": "pump_mayhem",
  "type": "BUY",
  "baseMint": "Ekdc6sFuc7s74caQyYTYTyQXQ9xgUoJBoSXm1Wgxpump",
  "quoteMint": "So11111111111111111111111111111111111111112",
  "user": "2oZVqd3hkzwyEYFpaWzM7KD4dpjqH9ZtFvg6c9VnLY9x",
  "inputToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "amountRaw": "49333252",
    "amount": 0.049333252,
    "decimals": 9
  },
  "outputToken": {
    "mint": "Ekdc6sFuc7s74caQyYTYTyQXQ9xgUoJBoSXm1Wgxpump",
    "amountRaw": "1761589116284",
    "amount": 1761589.116284,
    "decimals": 6
  },
  "fee": 2790542919109443600,
  "creatorFee": 129570701960,
  "virtualSolReserves": 30049333252,
  "virtualTokenReserves": 1071238410883716,
  "realSolReserves": 49333252,
  "realTokenReserves": 791338410883716,
  "signature": "...",
  "slot": 384181938,
  "timestamp": 1764758103,
  "idx": "5-5"
}
```

---

### SELL

Evento emitido cuando un usuario vende tokens a la bonding curve.

```typescript
{
  // Identificación
  protocol: "Pumpfun",
  type: "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,           // Mint del token vendido
  quoteMint: string,          // SOL

  // Usuario
  user: string,               // Address del vendedor

  // Amounts
  inputToken: {
    mint: string,             // Token mint (lo que vende)
    amountRaw: string,
    amount: number,
    decimals: number,
  },
  outputToken: {
    mint: string,             // SOL (lo que recibe)
    amountRaw: string,
    amount: number,
    decimals: number,
  },

  // Fees
  fee: number,
  creatorFee: number,

  // Estado de la Bonding Curve (post-trade)
  virtualSolReserves: number,
  virtualTokenReserves: number,
  realSolReserves: number,
  realTokenReserves: number,
}
```

---

### COMPLETE

Evento emitido cuando la bonding curve completa y está lista para migrar a un AMM.

```typescript
{
  // Identificación
  protocol: "Pumpfun",
  type: "COMPLETE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,
  quoteMint: string,

  // Bonding Curve
  bondingCurve: string,
  user: string,               // Usuario que triggereó el complete
}
```

---

### MIGRATE

Evento emitido cuando el token migra de la bonding curve a un AMM (Raydium).

```typescript
{
  // Identificación
  protocol: "Pumpfun",
  type: "MIGRATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,
  quoteMint: string,

  // Migration Info
  bondingCurve: string,
  pool: string,               // Pool address en el AMM destino
  user: string,

  // Migration Amounts (si disponibles)
  migratedTokenAmount?: number,
  migratedSolAmount?: number,
  migrationFee?: number,
}
```

---

## Meteora DBC (Dynamic Bonding Curve)

**Program ID:** `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`

### CREATE (UnifiedCreateEvent)

Meteora DBC utiliza la nueva estructura `UnifiedCreateEvent` con nomenclatura semántica y agnóstica del protocolo.

**Diferencias clave con la estructura legacy `MemeEvent`:**
- Campos agrupados en objetos (`baseToken`, `quoteToken`)
- Nomenclatura semántica: **Curve** (mecánica de precio) vs **Vault** (estado de custodia)
- Campo `platform` en lugar de `launchpadPlatform`

```typescript
interface UnifiedCreateEvent {
  // --- IDENTIFICACIÓN ---
  type: "CREATE",                // Tipo de evento
  protocol: "MeteoraDBC",        // Protocolo
  platform: string,              // Plataforma (antes 'launchpadPlatform')
  signature: string,             // Signature de la transacción
  slot: number,                  // Slot de la transacción
  timestamp: number,             // Unix timestamp
  idx: string,                   // Índice de instrucción (ej: "0-0")

  // --- ACTIVOS (Agrupados) ---
  baseToken: {
    mint: string,                // Mint address del token creado
    name: string,                // Nombre del token
    symbol: string,              // Símbolo del token
    uri: string,                 // URI de metadata (IPFS)
    decimals: number,            // Decimales del token (típicamente 6)
    totalSupply: number,         // Supply total (1e15 = 1B tokens con 6 decimales)
    programId: string,           // Token program (SPL Token o Token-2022)
  },
  quoteToken: {
    mint: string,                // "So11111111111111111111111111111111111111112" (SOL)
    symbol: "SOL",               // Símbolo
    decimals: 9,                 // Decimales
  },

  // --- DIRECCIONES ---
  poolAddress: string,           // Address del pool/bonding curve (antes 'pool'/'bondingCurve')
  configAddress: string,         // Configuración de la plataforma (antes 'platformConfig')
  creatorAddress: string,        // Address del creador (antes 'creator'/'user')

  // --- MECÁNICA DE PRECIO (CURVE) ---
  // Reservas matemáticas que determinan el precio (Price = curveQuoteReserves / curveBaseReserves)
  curveType: "DynamicBondingCurve",  // Curva segmentada por rangos de precio
  curveBaseReserves: number,         // Tokens virtuales (antes 'virtualTokenReserves')
  curveQuoteReserves: number,        // SOL virtual (antes 'virtualSolReserves')

  // --- ESTADO DE CUSTODIA (VAULT) ---
  // Inventario real disponible para la venta
  vaultBaseReserves: number,         // Tokens reales restantes (antes 'realTokenReserves')
  vaultQuoteReserves: number,        // SOL acumulado/TVL (antes 'realSolReserves')

  // --- METAS ---
  initialSaleSupply: number,         // Inventario inicial a la venta (antes 'totalBaseSell')
  graduationThreshold: number,       // SOL necesario para migrar (antes 'totalQuoteFundRaising')
}
```

**Ejemplo real:**
```json
{
  "type": "CREATE",
  "protocol": "MeteoraDBC",
  "platform": "MeteoraDBC",
  "baseToken": {
    "mint": "D18Xiw9M5qwMvjZ4GQWThFZsgNdyPaKcgXQuGFbddoge",
    "name": "Pet Rock",
    "symbol": "PETROCK",
    "uri": "https://cdn-aibackrooms.s3.amazonaws.com/PETROCK/token-metadata.json",
    "decimals": 6,
    "totalSupply": 1000000000000000,
    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  },
  "quoteToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "decimals": 9
  },
  "poolAddress": "4kyLgZ8gwmM5hGdue8aAodvVPmsjpYz5CoFX43jFW3X8",
  "configAddress": "GybkUNYVNk1FZMt9myAfvpSVgoKBgaueMTvszwBN4qYx",
  "creatorAddress": "ACBxiEbfcSpMRfd1ZsB8qoQ9qmkAyKtgwqijDDp4A3nj",
  "curveType": "DynamicBondingCurve",
  "curveBaseReserves": 1000000000000000,
  "curveQuoteReserves": 28489051,
  "vaultBaseReserves": 1000000000000000,
  "vaultQuoteReserves": 0,
  "initialSaleSupply": 1000000000000000,
  "graduationThreshold": 98377113977,
  "signature": "2gQWdNyC4xsFqqfzWx9gYV1WUUZCHDBCB5RdTDQvfBqG6Burr1Ye5mMBiKpEtzXjQYEpPAHYvYzuZAP8zVuDujnN",
  "slot": 384414846,
  "timestamp": 1764848647,
  "idx": "0-0"
}
```

> **Nota sobre `platform`:** Si el token no fue creado a través de una plataforma conocida (Believe, BOOP, DaosFun, etc.), se usa "MeteoraDBC" como valor por defecto.

> **Nota sobre `curveType: "DynamicBondingCurve"`:** Meteora DBC usa una curva segmentada por rangos de precio (hasta 16 segmentos configurables). Aunque internamente usa la fórmula de producto constante, la estructura multi-segmento la diferencia de una AMM estándar.

> **Nota sobre `graduationThreshold`:** Este campo se extrae del evento `EvtCreateConfig` o `EvtCreateConfigV2` emitido cuando se crea la configuración del pool. Representa el umbral de SOL (en lamports) que debe alcanzar el pool para graduarse a un AMM. Ejemplo: `98377113977` ≈ 98.4 SOL.

#### Mapping de nomenclatura (Legacy → Nueva)

| Legacy (MemeEvent) | Nueva (UnifiedCreateEvent) |
|-------------------|---------------------------|
| `type: "CREATE"` | `type: "CREATE"` |
| `launchpadPlatform` | `platform` |
| `baseMint` | `baseToken.mint` |
| `name` | `baseToken.name` |
| `symbol` | `baseToken.symbol` |
| `uri` | `baseToken.uri` |
| `decimals` | `baseToken.decimals` |
| `totalSupply` / `tokenTotalSupply` | `baseToken.totalSupply` |
| `tokenProgram` | `baseToken.programId` |
| `quoteMint` | `quoteToken.mint` |
| `pool` / `bondingCurve` | `poolAddress` |
| `platformConfig` | `configAddress` |
| `creator` / `user` | `creatorAddress` |
| `virtualTokenReserves` | `curveBaseReserves` |
| `virtualSolReserves` | `curveQuoteReserves` |
| `realTokenReserves` | `vaultBaseReserves` |
| `realSolReserves` | `vaultQuoteReserves` |
| `totalBaseSell` | `initialSaleSupply` |
| `totalQuoteFundRaising` | `graduationThreshold` |

---

### BUY

Evento emitido cuando un usuario compra tokens del pool.

```typescript
{
  // Identificación
  protocol: "MeteoraDBC",
  type: "BUY",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,           // Mint del token comprado
  quoteMint: string,          // SOL

  // Pool Info
  pool: string,               // Address del pool
  bondingCurve: string,       // Address de la bonding curve

  // Usuario
  user: string,               // Address del comprador

  // Amounts
  inputToken: {
    mint: string,             // SOL mint
    amountRaw: string,        // Cantidad en lamports (string)
    amount: number,           // Cantidad en SOL (decimal)
    decimals: number,         // 9
  },
  outputToken: {
    mint: string,             // Token mint
    amountRaw: string,        // Cantidad en unidades mínimas
    amount: number,           // Cantidad decimal
    decimals: number,         // Típicamente 6
  },

  // Fees (de eventos CPI EvtSwap/EvtSwap2)
  fee?: number,               // Fee total (tradingFee + protocolFee + referralFee)
  feeRaw?: string,            // Fee total en unidades mínimas
  feeMint?: string,           // Mint del token de fee (quoteMint)
  feeDecimals?: number,       // Decimales del fee

  // Estado de la Bonding Curve (post-trade)
  realTokenReserves?: number, // Tokens restantes en el pool (de transfer data)
  realSolReserves?: number,   // SOL en el pool (de EvtSwap2 o transfer data)
}
```

**Ejemplo real:**
```json
{
  "type": "BUY",
  "baseMint": "6ApdDVvYhNScomGjzkCxBRzehWhB6NiPaf3VVYEcLYME",
  "quoteMint": "So11111111111111111111111111111111111111112",
  "bondingCurve": "9uc59u42BGuXRjXC7eiy3t8jS4EzJoJ31oWAPUyo2Evy",
  "pool": "9uc59u42BGuXRjXC7eiy3t8jS4EzJoJ31oWAPUyo2Evy",
  "user": "HLi3KZWqFWBkj3pxiLqL2eFYBq55sP8vH7ZCzfBpn32y",
  "inputToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "amountRaw": "80000000000",
    "amount": 80,
    "decimals": 9
  },
  "outputToken": {
    "mint": "6ApdDVvYhNScomGjzkCxBRzehWhB6NiPaf3VVYEcLYME",
    "amountRaw": "175006899798061",
    "amount": 175006899.798061,
    "decimals": 6
  },
  "fee": 800000000,
  "feeRaw": "800000000",
  "feeMint": "So11111111111111111111111111111111111111112",
  "feeDecimals": 9,
  "realTokenReserves": 824993100201939,
  "realSolReserves": 80000000000,
  "protocol": "MeteoraDBC",
  "signature": "5MAif2xVG3HJLYW1ZpyM6xoJf8vRJiPBTUVwpWgWR2dZzb1DLEGFN6nximmu3oAu9r3AFZBncTEaxsoWR4KYJWZM",
  "slot": 384240201,
  "timestamp": 1764780791,
  "idx": "0-0"
}
```

> **Nota sobre Reserves en Meteora DBC:** Meteora DBC usa una curva sqrt_price diferente a Pumpfun/Raydium que usan una curva AMM tradicional. Por esta razón, no hay virtualReserves como en otros protocolos. Las realReserves se extraen de:
> - `realSolReserves`: Evento EvtSwap2 (quote_reserve_amount) o transfer data (post-balance del vault)
> - `realTokenReserves`: Transfer data (post-balance del token vault)

---

### SELL

Evento emitido cuando un usuario vende tokens al pool.

```typescript
{
  // Identificación
  protocol: "MeteoraDBC",
  type: "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,           // Mint del token vendido
  quoteMint: string,          // SOL

  // Pool Info
  pool: string,               // Address del pool
  bondingCurve: string,       // Address de la bonding curve

  // Usuario
  user: string,               // Address del vendedor

  // Amounts
  inputToken: {
    mint: string,             // Token mint (lo que vende)
    amountRaw: string,
    amount: number,
    decimals: number,         // Típicamente 6
  },
  outputToken: {
    mint: string,             // SOL (lo que recibe)
    amountRaw: string,
    amount: number,
    decimals: number,         // 9
  },

  // Fees (de eventos CPI EvtSwap/EvtSwap2)
  fee?: number,               // Fee total (tradingFee + protocolFee + referralFee)
  feeRaw?: string,            // Fee total en unidades mínimas
  feeMint?: string,           // Mint del token de fee (quoteMint)
  feeDecimals?: number,       // Decimales del fee

  // Estado de la Bonding Curve (post-trade)
  realTokenReserves?: number, // Tokens en el pool después del trade (de transfer data)
  realSolReserves?: number,   // SOL en el pool después del trade (de EvtSwap2 o transfer data)
}
```

---

### COMPLETE

Evento emitido cuando la bonding curve completa y está lista para migrar.

```typescript
{
  // Identificación
  protocol: "MeteoraDBC",
  type: "COMPLETE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,
  quoteMint: string,

  // Pool Info
  pool: string,
  bondingCurve: string,
  user: string,
}
```

---

### MIGRATE

Evento emitido cuando el token migra a un AMM (Meteora DAMM, etc.).

```typescript
{
  // Identificación
  protocol: "MeteoraDBC",
  type: "MIGRATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,
  quoteMint: string,

  // Migration Info
  pool: string,               // Pool original de DBC
  bondingCurve: string,
  user: string,
}
```

---

## Raydium Launchpad

**Program ID:** `LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj`

### CREATE

Evento emitido cuando se crea un nuevo token en Raydium Launchpad.

```typescript
{
  // Identificación
  protocol: "RaydiumLaunchpad",
  launchpad: "RaydiumLaunchpad",
  launchpadPlatform: string,  // Plataforma (ej: "letsbonk.fun", "BAGS", "Believe", etc.)
  type: "CREATE",
  signature: string,          // Signature de la transacción
  slot: number,               // Slot de la transacción
  timestamp: number,          // Unix timestamp
  idx: string,                // Índice de instrucción (ej: "0-7")

  // Token Info
  baseMint: string,           // Mint address del token creado
  quoteMint: string,          // "So11111111111111111111111111111111111111112" (SOL)
  name: string,               // Nombre del token
  symbol: string,             // Símbolo del token
  uri: string,                // URI de metadata (IPFS)
  decimals: number,           // Decimales del token (típicamente 6)
  totalSupply: number,        // Supply total del token (normalizado)
  tokenTotalSupply: number,   // Supply total del token

  // Pool Info
  bondingCurve: string,       // Address de la bonding curve
  pool: string,               // Address del pool/bonding curve (= bondingCurve)
  creator: string,            // Address del creador
  user: string,               // Address del usuario (mismo que creator)
  platformConfig: string,     // Configuración de la plataforma

  // Bonding Curve Reserves (iniciales - normalizados con Pumpfun)
  virtualTokenReserves: number,   // Tokens virtuales (calculados desde curveParam)
  virtualSolReserves: number,     // SOL virtual (calculados desde curveParam)
  realTokenReserves: number,      // Tokens disponibles (igual a totalBaseSell al inicio)

  // Bonding Curve Config (normalizado)
  curveType: "ConstantProduct",               // Tipo de curva AMM (x * y = k)
  totalQuoteFundRaising: number,              // Total de SOL a recaudar para graduación
  totalBaseSell: number,                      // Inventario inicial de tokens a vender
  tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token (default)
}
```

**Ejemplo real:**
```json
{
  "protocol": "RaydiumLaunchpad",
  "launchpad": "RaydiumLaunchpad",
  "launchpadPlatform": "letsbonk.fun",
  "type": "CREATE",
  "timestamp": 1733358591,
  "user": "MyiMGekeHSrA8veD67BBesXucmkSvRL8xtAA3VkciDF",
  "creator": "MyiMGekeHSrA8veD67BBesXucmkSvRL8xtAA3VkciDF",
  "baseMint": "7axoqTnRU3MFDKyjbAzeP2BeMUivhMPCMV7v338Pbonk",
  "quoteMint": "So11111111111111111111111111111111111111112",
  "name": "Akita inu",
  "symbol": "Akita",
  "uri": "https://ipfs.io/ipfs/bafkreib26q5gwftvddwaitypg3bmj2g6l6loowfn4fjgem2q4zoh4gqbiq",
  "decimals": 6,
  "totalSupply": 1000000000000000,
  "tokenTotalSupply": 1000000000000000,
  "bondingCurve": "Ck12SHCcs6t6bBCSo8LsLoiaSQq81FCLUVLaazKib1QC",
  "pool": "Ck12SHCcs6t6bBCSo8LsLoiaSQq81FCLUVLaazKib1QC",
  "platformConfig": "FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1",
  "virtualTokenReserves": 1073025605596382,
  "virtualSolReserves": 30000852951,
  "realTokenReserves": 793100000000000,
  "curveType": "ConstantProduct",
  "totalQuoteFundRaising": 85000000000,
  "totalBaseSell": 793100000000000,
  "tokenProgram": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "signature": "eN8jmv89NLPVzFDopsTEmtLscHenQZNygdWzbtSTnFvhXrLa4wd2cDQDwEPrduS7Le7n2ttcDWp8nkMZTfmaqPk",
  "slot": 312617523,
  "idx": "0-7"
}
```

> **Nota sobre `curveType`:** Raydium Launchpad emite el tipo de curva en el evento como "Constant". Este valor se normaliza a "ConstantProduct" para unificar la nomenclatura con Pumpfun (curva AMM x * y = k).

---

### BUY

Evento emitido cuando un usuario compra tokens de la bonding curve.

```typescript
{
  // Identificación
  protocol: "RaydiumLaunchpad",
  type: "BUY",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,           // Mint del token comprado
  quoteMint: string,          // SOL

  // Bonding Curve
  bondingCurve: string,       // Address de la bonding curve
  user: string,               // Address del comprador

  // Amounts
  inputToken: {
    mint: string,             // SOL mint
    amountRaw: string,        // Cantidad en lamports (string)
    amount: number,           // Cantidad en SOL (decimal)
    decimals: number,         // 9
  },
  outputToken: {
    mint: string,             // Token mint
    amountRaw: string,        // Cantidad en unidades mínimas
    amount: number,           // Cantidad decimal
    decimals: number,         // Típicamente 6
  },

  // Fees
  fee: number,                // Fee total
  platformFee: number,        // Fee de la plataforma
  shareFee: number,           // Fee de share
  creatorFee: number,         // Fee para el creador

  // Estado de la Bonding Curve (post-trade)
  // Virtual reserves: valores actuales de la curva CPMM (cambian con cada trade)
  virtualSolReserves: string,
  virtualTokenReserves: string,
  // Real reserves: realTokenReserves = INVENTARIO restante (totalBaseSell - tokensVendidos)
  realSolReserves: string,        // SOL acumulado en el pool
  realTokenReserves: string,      // Tokens disponibles para compra
}
```

**Ejemplo real:**
```json
{
  "protocol": "RaydiumLaunchpad",
  "type": "BUY",
  "bondingCurve": "CPTNvVYT7qCzX3HnRRtSRAFpMipVgSP3eynXrW9p9YgD",
  "baseMint": "25phz2ZHEfB81RQXKvNLvkDbK32nyUwFnQdqk6MLcook",
  "quoteMint": "So11111111111111111111111111111111111111112",
  "user": "J88snVaNTCW7T6saPvAmYDmjnhPiSpkw8uJ8FFCyfcGA",
  "inputToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "amountRaw": "10000000",
    "amount": 0.01,
    "decimals": 9
  },
  "outputToken": {
    "mint": "25phz2ZHEfB81RQXKvNLvkDbK32nyUwFnQdqk6MLcook",
    "amountRaw": "353971575213",
    "amount": 353971.575213,
    "decimals": 6
  },
  "fee": 25000,
  "platformFee": 75000,
  "shareFee": 0,
  "creatorFee": 0,
  "virtualTokenReserves": "1073025605596382",
  "virtualSolReserves": "30000852951",
  "realTokenReserves": "792746028424787",
  "realSolReserves": "9900000",
  "signature": "...",
  "slot": 334260517,
  "timestamp": 1744972806,
  "idx": "4-0"
}
```

> **Nota sobre realTokenReserves:** El valor anterior `353971575213` era incorrecto porque representaba los tokens vendidos (salidos del pool). El valor correcto `792746028424787` representa el inventario restante = `totalBaseSell (793.1T) - tokensVendidos (353.9B) = 792.7T`

---

### SELL

Evento emitido cuando un usuario vende tokens a la bonding curve.

```typescript
{
  // Identificación
  protocol: "RaydiumLaunchpad",
  type: "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,           // Mint del token vendido
  quoteMint: string,          // SOL

  // Bonding Curve
  bondingCurve: string,
  user: string,               // Address del vendedor

  // Amounts
  inputToken: {
    mint: string,             // Token mint (lo que vende)
    amountRaw: string,
    amount: number,
    decimals: number,
  },
  outputToken: {
    mint: string,             // SOL (lo que recibe)
    amountRaw: string,
    amount: number,
    decimals: number,
  },

  // Fees
  fee: number,
  platformFee: number,
  shareFee: number,
  creatorFee: number,

  // Estado de la Bonding Curve (post-trade)
  virtualSolReserves: string,
  virtualTokenReserves: string,
  realSolReserves: string,
  realTokenReserves: string,
}
```

---

### COMPLETE

Evento emitido cuando la bonding curve completa.

```typescript
{
  // Identificación
  protocol: "RaydiumLaunchpad",
  type: "COMPLETE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,
  quoteMint: string,

  // Bonding Curve
  bondingCurve: string,
  user: string,
}
```

---

### MIGRATE

Evento emitido cuando el token migra de la bonding curve a un AMM (Raydium AMM o CPMM).

```typescript
{
  // Identificación
  protocol: "RaydiumLaunchpad",
  type: "MIGRATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Token Info
  baseMint: string,
  quoteMint: string,

  // Migration Info
  bondingCurve: string,
  pool: string,               // Pool address en el AMM destino
  user: string,
}
```

---

## Notas Generales

### Campos Comunes a Todos los Eventos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `protocol` | string | Nombre del protocolo (Pumpfun, RaydiumLaunchpad, MeteoraDBC) |
| `launchpad` | string | Protocolo base del launchpad (igual que protocol) |
| `launchpadPlatform` | string | Plataforma frontend (pump.fun, pump_mayhem, letsbonk.fun, BAGS, Believe, etc.) |
| `type` | string | Tipo de evento (CREATE, BUY, SELL, COMPLETE, MIGRATE) |
| `signature` | string | Signature de la transacción |
| `slot` | number | Slot de Solana |
| `timestamp` | number | Unix timestamp |
| `idx` | string | Índice de instrucción formato "outer-inner" |
| `baseMint` | string | Token mint address |
| `quoteMint` | string | Quote token (usualmente SOL) |
| `user` | string | Usuario que ejecutó la transacción |

### Campos Comunes en Eventos CREATE

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `creator` | string | Address del creador del token |
| `name` | string | Nombre del token |
| `symbol` | string | Símbolo del token |
| `uri` | string | URI de metadata (IPFS) |
| `decimals` | number | Decimales del token |
| `pool` | string | Address del pool/bonding curve |
| `platformConfig` | string | Configuración de la plataforma |
| `virtualTokenReserves` | number/string | Tokens virtuales en la curva |
| `virtualSolReserves` | number/string | SOL virtual en la curva |
| `realTokenReserves` | number/string | Tokens reales disponibles |
| `tokenTotalSupply` | number/string | Supply total del token |
| `curveType` | string | Tipo de curva: "ConstantProduct" o "DynamicBondingCurve" |
| `totalQuoteFundRaising` | number/string | SOL necesario para graduación (lamports) |
| `totalBaseSell` | number/string | Inventario inicial de tokens a vender |
| `tokenProgram` | string | Token program address (SPL o Token-2022) |

### Token Amounts

Los amounts se devuelven en dos formatos:
- `amountRaw`: String con la cantidad en unidades mínimas (lamports para SOL, unidades mínimas para tokens)
- `amount`: Number con la cantidad decimal (ya dividida por 10^decimals)

### Token Program (CREATE)

El campo `tokenProgram` indica el programa de token usado:
- **SPL Token** (default): `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- **Token-2022**: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`

Token-2022 se usa principalmente en Pumpfun cuando `launchpadPlatform: "pump_mayhem"`.

### Curve Type (CREATE)

El campo `curveType` indica el modelo matemático de la bonding curve:
- **ConstantProduct** (Pumpfun, Raydium): Curva AMM continua única (x * y = k)
- **DynamicBondingCurve** (Meteora): Curva segmentada por rangos de precio (hasta 16 segmentos)

### Bonding Curve Reserves

Las reservas de la bonding curve están normalizadas en los eventos CREATE, BUY y SELL:

| Protocolo | CREATE | BUY/SELL | Notas |
|-----------|--------|----------|-------|
| **Pumpfun** | ✅ `virtualTokenReserves`, `virtualSolReserves`, `realTokenReserves` | ✅ Todas las reserves post-trade | Curva AMM tradicional |
| **Raydium Launchpad** | ✅ `virtualTokenReserves`, `virtualSolReserves`, `realTokenReserves` | ✅ Todas las reserves post-trade | Curva constante (calculada desde curveParam) |
| **Meteora DBC** | ✅ `virtualTokenReserves`, `virtualSolReserves`, `realTokenReserves` | ✅ `realTokenReserves`, `realSolReserves` | Curva sqrt_price normalizada |

**Valores iniciales (CREATE):**

| Protocolo | virtualTokenReserves | virtualSolReserves | realTokenReserves |
|-----------|---------------------|-------------------|-------------------|
| **Pumpfun** | 1,073,000,000,000,000 | 30,000,000,000 | 793,100,000,000,000 |
| **Raydium Launchpad** | Calculado* | Calculado* | totalBaseSell |
| **Meteora DBC** | tokenTotalSupply | Calculado** | tokenTotalSupply |

\* Para Raydium Launchpad, las virtual reserves se calculan usando la fórmula de `getInitParam` del SDK:
```
supplyMinusSellLocked = supply - totalBaseSell - totalLockedAmount
denominator = (totalFundRaising × totalBaseSell / supplyMinusSellLocked) - totalFundRaising
virtualTokenReserves = (totalFundRaising × totalBaseSell² / supplyMinusSellLocked) / denominator
virtualSolReserves = totalFundRaising² / denominator
```
Ejemplo: supply=1B, totalBaseSell=800M, totalFundRaising=30 SOL → virtualTokenReserves≈1.067T, virtualSolReserves=10 SOL

\** Para Meteora DBC, `virtualSolReserves` se calcula desde `sqrt_start_price` usando aritmética Q64.64:
```
price = (sqrt_start_price / 2^64)²
virtualSolReserves = virtualTokenReserves × price
```

**Notas sobre Meteora DBC:**
- `virtualTokenReserves` en CREATE = tokenTotalSupply (1B tokens con 6 decimales)
- `virtualSolReserves` en CREATE = calculado desde sqrt_start_price de la configuración
- En BUY/SELL, las reserves se extraen de:
  - Transfer data: post-balance del vault de tokens y SOL
  - EvtSwap2: quote_reserve_amount (SOL) cuando está disponible

---

## Resumen de Campos CREATE por Protocolo

### Arquitectura de tipos

```
                           PUMPFUN    RAYDIUM LCP    METEORA DBC
────────────────────────────────────────────────────────────────────
  Tipo de evento           MemeEvent   MemeEvent   UnifiedCreateEvent
  Estructura               Plana       Plana       Agrupada (Curve/Vault)
```

### Campos MemeEvent (Pumpfun, Raydium Launchpad)

```
                           PUMPFUN    RAYDIUM LCP
────────────────────────────────────────────────────
  type                        ✅          ✅
  protocol                    ✅          ✅
  launchpad                   ✅          ✅
  launchpadPlatform           ✅          ✅
  timestamp                   ✅          ✅
  user                        ✅          ✅
  creator                     ✅          ✅
  baseMint                    ✅          ✅
  quoteMint                   ✅          ✅
  name                        ✅          ✅
  symbol                      ✅          ✅
  uri                         ✅          ✅
  decimals                    ✅          ✅
  totalSupply                 ✅          ✅
  bondingCurve                ✅          ✅
  pool                        ✅          ✅
  platformConfig              ✅          ✅
  virtualTokenReserves        ✅          ✅
  virtualSolReserves          ✅          ✅
  realTokenReserves           ✅          ✅
  tokenTotalSupply            ✅          ✅
  curveType                   ✅          ✅
  totalQuoteFundRaising       ✅          ✅
  totalBaseSell               ✅          ✅
  tokenProgram                ✅          ✅
```

### Campos UnifiedCreateEvent (Meteora DBC)

```
METEORA DBC (UnifiedCreateEvent)
────────────────────────────────────────────────────
  type: "CREATE"                   ✅
  protocol                         ✅
  platform                         ✅
  signature, slot, timestamp, idx  ✅

  baseToken.mint                   ✅
  baseToken.name                   ✅
  baseToken.symbol                 ✅
  baseToken.uri                    ✅
  baseToken.decimals               ✅
  baseToken.totalSupply            ✅
  baseToken.programId              ✅

  quoteToken.mint                  ✅
  quoteToken.symbol                ✅
  quoteToken.decimals              ✅

  poolAddress                      ✅
  configAddress                    ✅
  creatorAddress                   ✅

  curveType                        ✅
  curveBaseReserves                ✅
  curveQuoteReserves               ✅

  vaultBaseReserves                ✅
  vaultQuoteReserves               ✅

  initialSaleSupply                ✅
  graduationThreshold              ✅
```

### Mapping Legacy → Nueva nomenclatura (Meteora DBC)

| Legacy (MemeEvent) | Nueva (UnifiedCreateEvent) |
|-------------------|---------------------------|
| `type: "CREATE"` | `type: "CREATE"` |
| `launchpadPlatform` | `platform` |
| `baseMint`, `name`, `symbol`, `uri`, `decimals` | `baseToken.{...}` |
| `tokenTotalSupply` / `totalSupply` | `baseToken.totalSupply` |
| `tokenProgram` | `baseToken.programId` |
| `quoteMint` | `quoteToken.mint` |
| `pool` / `bondingCurve` | `poolAddress` |
| `platformConfig` | `configAddress` |
| `creator` / `user` | `creatorAddress` |
| `virtualTokenReserves` | `curveBaseReserves` |
| `virtualSolReserves` | `curveQuoteReserves` |
| `realTokenReserves` | `vaultBaseReserves` |
| `realSolReserves` | `vaultQuoteReserves` |
| `totalBaseSell` | `initialSaleSupply` |
| `totalQuoteFundRaising` | `graduationThreshold` |

### Valores por Defecto

| Campo | Pumpfun | Raydium LCP | Meteora DBC |
|-------|---------|-------------|-------------|
| `curveType` | `"ConstantProduct"` | `"ConstantProduct"`† | `"DynamicBondingCurve"` |
| Graduation SOL | 85 SOL (fijo) | configurable | configurable |
| Token Program | dinámico | SPL Token | SPL Token |

**Notas:**
- † Raydium LCP emite `"Constant"` en el evento, que se normaliza a `"ConstantProduct"`.
- Meteora DBC usa `UnifiedCreateEvent` con nomenclatura Curve/Vault en lugar de Virtual/Real.

### Valores de tokenProgram

| Programa | Address |
|----------|---------|
| **SPL Token** (default) | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| **Token-2022** | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |

---

## Boopfun

**Program ID:** `boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4`

### CREATE (UnifiedCreateEvent)

Boopfun utiliza la estructura `UnifiedCreateEvent` con nomenclatura semántica.

```typescript
{
  // Identificación
  protocol: "Boopfun",
  launchpad: "Boopfun",
  type: "CREATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Activos (Agrupados)
  baseToken: {
    mint: string,
    name: string,
    symbol: string,
    uri: string,
    decimals: 9,              // Boopfun usa 9 decimales
    totalSupply: number,      // 1,000,000,000 (1B tokens)
    programId: string,        // SPL Token program
  },
  quoteToken: {
    mint: string,             // SOL
    symbol: "SOL",
    decimals: 9,
  },

  // Direcciones
  poolAddress: string,
  configAddress: string,
  creatorAddress: string,

  // Mecánica de Precio (CURVE)
  curveType: "ConstantProduct",
  curveBaseReserves: number,  // 1,000,000,000,000,000,000 (1B virtual tokens, 9 decimals - NO offset, Virtual = Real)
  curveQuoteReserves: number, // 29,731,395,800 (~29.73 SOL virtual)

  // Estado de Custodia (VAULT)
  vaultBaseReserves: number,  // 1,000,000,000,000,000,000 (1B tokens, 9 decimals)
  vaultQuoteReserves: 0,

  // Metas
  initialSaleSupply: number,
  graduationThreshold: number, // 85,000,000,000 (85 SOL)
}
```

**Ejemplo real:**
```json
{
  "protocol": "Boopfun",
  "launchpad": "Boopfun",
  "type": "CREATE",
  "baseToken": {
    "mint": "7YPVKxJZq5J4C5m6Q7Zfa3qpfgJqo2Zyj1QdpV2Vpump",
    "name": "Test Token",
    "symbol": "TEST",
    "uri": "https://ipfs.io/ipfs/...",
    "decimals": 9,
    "totalSupply": 1000000000000000000,
    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  },
  "quoteToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "decimals": 9
  },
  "poolAddress": "...",
  "configAddress": "...",
  "creatorAddress": "...",
  "curveType": "ConstantProduct",
  "curveBaseReserves": 73000000000000000,
  "curveQuoteReserves": 30000000000,
  "vaultBaseReserves": 1000000000000000000,
  "vaultQuoteReserves": 0,
  "initialSaleSupply": 1000000000000000000,
  "graduationThreshold": 85000000000,
  "signature": "...",
  "slot": 384000000,
  "timestamp": 1764000000,
  "idx": "0-0"
}
```

---

### BUY

```typescript
{
  protocol: "Boopfun",
  launchpad: "Boopfun",
  type: "BUY",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  user: string,

  inputToken: {
    mint: string,             // SOL
    amountRaw: string,
    amount: number,
    decimals: 9,
  },
  outputToken: {
    mint: string,             // Token mint
    amountRaw: string,
    amount: number,
    decimals: 9,
  },
}
```

---

### SELL

```typescript
{
  protocol: "Boopfun",
  launchpad: "Boopfun",
  type: "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  user: string,

  inputToken: {
    mint: string,             // Token mint
    amountRaw: string,
    amount: number,
    decimals: 9,
  },
  outputToken: {
    mint: string,             // SOL
    amountRaw: string,
    amount: number,
    decimals: 9,
  },
}
```

---

### COMPLETE

```typescript
{
  protocol: "Boopfun",
  launchpad: "Boopfun",
  type: "COMPLETE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  user: string,
}
```

---

## Moonit

**Program ID:** `MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG`

### CREATE (UnifiedCreateEvent)

Moonit utiliza una **curva lineal (LinearV1)** en lugar de ConstantProduct. Esto significa que el precio aumenta linealmente con cada compra, no exponencialmente.

```typescript
{
  // Identificación
  protocol: "Moonit",
  launchpad: "Moonit",
  type: "CREATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Pool Info
  pool: string,
  poolAddress: string,
  user: string,

  // Activos (Agrupados)
  baseToken: {
    mint: string,
    name: string,
    symbol: string,
    uri: string,
    decimals: number,         // Configurable por token (típicamente 9)
    totalSupply: number,      // UI amount
    programId: string,        // SPL Token program
  },
  quoteToken: {
    mint: string,             // SOL
    symbol: "SOL",
    decimals: 9,
  },

  // Direcciones
  creatorAddress: string,

  // Mecánica de Precio (CURVE) - Linear
  curveType: "LinearV1",      // ⚠️ Diferente a otras plataformas
  curveBaseReserves: number,  // 1,000,000,000,000,000,000 (tokens en curva)
  curveQuoteReserves: 0,      // SOL empieza en 0 para curva lineal

  // Estado de Custodia (VAULT)
  vaultBaseReserves: number,  // = curveBaseReserves
  vaultQuoteReserves: 0,

  // Metas
  initialSaleSupply: number,
  graduationThreshold: number, // 500,000,000,000 (500 SOL market cap threshold)
}
```

**Ejemplo real:**
```json
{
  "protocol": "Moonit",
  "launchpad": "Moonit",
  "type": "CREATE",
  "pool": "7XmxEjM4dJAZoNJGjpEvQHJ54TSLQ8oLy6c9ZjT5sMjz",
  "poolAddress": "7XmxEjM4dJAZoNJGjpEvQHJ54TSLQ8oLy6c9ZjT5sMjz",
  "user": "5h2fwG7u4...",
  "baseToken": {
    "mint": "DtKtJEHV...",
    "name": "Moon Token",
    "symbol": "MOON",
    "uri": "https://...",
    "decimals": 9,
    "totalSupply": 1000000000,
    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  },
  "quoteToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "decimals": 9
  },
  "creatorAddress": "5h2fwG7u4...",
  "curveType": "LinearV1",
  "curveBaseReserves": 1000000000000000000,
  "curveQuoteReserves": 0,
  "vaultBaseReserves": 1000000000000000000,
  "vaultQuoteReserves": 0,
  "initialSaleSupply": 1000000000000000000,
  "graduationThreshold": 500000000000,
  "signature": "...",
  "slot": 384000000,
  "timestamp": 1764000000,
  "idx": "0-0"
}
```

> **Nota sobre `curveType: "LinearV1"`:** Moonit usa una curva lineal donde el precio aumenta proporcionalmente con la cantidad de tokens vendidos, a diferencia de la curva de producto constante (x * y = k) usada por Pumpfun, Raydium, etc.

---

### BUY

```typescript
{
  protocol: "Moonit",
  launchpad: "Moonit",
  type: "BUY",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  pool: string,
  user: string,
  configAddress: string,

  inputToken: {
    mint: string,             // SOL
    amountRaw: string,
    decimals: 9,
  },
  outputToken: {
    mint: string,             // Token mint
    amountRaw: string,
    decimals: 9,
  },
}
```

---

### SELL

```typescript
{
  protocol: "Moonit",
  launchpad: "Moonit",
  type: "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,          // SOL, USDC, o USDT
  poolAddress: string,
  pool: string,
  user: string,

  inputToken: {
    mint: string,
    amountRaw: string,
    amount: number,
    decimals: number,
  },
  outputToken: {
    mint: string,
    amountRaw: string,
    amount: number,
    decimals: number,
  },

  fee: number,                // Fee de transacción
}
```

> **Nota sobre quoteMint:** Moonit soporta múltiples colaterales: SOL, USDC, y USDT.

---

### MIGRATE

```typescript
{
  protocol: "Moonit",
  launchpad: "Moonit",
  type: "MIGRATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
}
```

---

## Heaven

**Program ID:** `HEAVENoP2qxoeuF8Dj2oT1GHEnu49U5mJYkdeC8BAX2o`

### CREATE (UnifiedCreateEvent)

Heaven crea tokens usando Metaplex para la metadata y tiene su propio sistema de pools.

```typescript
{
  // Identificación
  protocol: "Heaven",
  launchpad: "Heaven",
  type: "CREATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Usuario
  user: string,

  // Activos (Agrupados)
  baseToken: {
    mint: string,
    name: string,
    symbol: string,
    uri: string,
    decimals: 9,              // Heaven usa 9 decimales
    totalSupply: number,      // 1,000,000,000 (1B tokens, UI amount)
    programId: string,        // SPL Token program
  },
  quoteToken: {
    mint: string,             // SOL
    symbol: "SOL",
    decimals: 9,
  },

  // Direcciones
  creatorAddress: string,
  poolAddress: string,        // Puede ser undefined si no se encuentra
  configAddress: string,      // ProtocolConfig account

  // Mecánica de Precio (CURVE)
  curveType: "ConstantProduct",
  curveBaseReserves: number,  // 1,000,000,000,000,000,000 (virtual tokens)
  curveQuoteReserves: number, // ~35,000,000,000 (35 SOL virtual, en lamports)

  // Estado de Custodia (VAULT)
  vaultBaseReserves: number,  // = curveBaseReserves
  vaultQuoteReserves: 0,

  // Metas
  initialSaleSupply: number,
  graduationThreshold: number, // ~85,000,000,000 (85 SOL)
}
```

**Ejemplo real:**
```json
{
  "protocol": "Heaven",
  "launchpad": "Heaven",
  "type": "CREATE",
  "user": "8KmzF...",
  "baseToken": {
    "mint": "Dk3M...",
    "name": "Heaven Token",
    "symbol": "HVN",
    "uri": "https://...",
    "decimals": 9,
    "totalSupply": 1000000000,
    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  },
  "quoteToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "decimals": 9
  },
  "creatorAddress": "8KmzF...",
  "poolAddress": "3xYk...",
  "configAddress": "5nKz...",
  "curveType": "ConstantProduct",
  "curveBaseReserves": 1000000000000000000,
  "curveQuoteReserves": 35000000000,
  "vaultBaseReserves": 1000000000000000000,
  "vaultQuoteReserves": 0,
  "initialSaleSupply": 1000000000000000000,
  "graduationThreshold": 85000000000,
  "signature": "MzDT4ZF...",
  "slot": 384000000,
  "timestamp": 1764000000,
  "idx": "0-0"
}
```

> **Nota sobre ProtocolConfig:** Heaven usa una cuenta `ProtocolConfig` con serialización bytemuck (C repr) que almacena `initial_token_a_amount` (u64), `initial_token_b_amount` (f64 en SOL), y otros parámetros de la curva.

---

### BUY

```typescript
{
  protocol: "Heaven",
  launchpad: "Heaven",
  type: "BUY",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  pool: string,
  user: string,
  configAddress: string,

  inputToken: {
    mint: string,             // SOL
    amountRaw: string,
    decimals: 9,
  },
  outputToken: {
    mint: string,             // Token mint
    amountRaw: string,
    decimals: 9,
  },
}
```

---

### SELL

```typescript
{
  protocol: "Heaven",
  launchpad: "Heaven",
  type: "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  pool: string,
  user: string,
  configAddress: string,

  inputToken: {
    mint: string,             // Token mint
    amountRaw: string,
    decimals: 9,
  },
  outputToken: {
    mint: string,             // SOL
    amountRaw: string,
    decimals: 9,
  },
}
```

---

## Sugar

**Program ID:** `deus4Bvftd5QKcEkE5muQaWGWDoma8GrySvPFrBPjhS`

### CREATE (UnifiedCreateEvent)

Sugar emite eventos completos desde el IDL con datos de reservas incluidos.

```typescript
{
  // Identificación
  protocol: "Sugar",
  launchpad: "Sugar",
  type: "CREATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  // Usuario
  user: string,

  // Activos (Agrupados)
  baseToken: {
    mint: string,
    name: string,
    symbol: string,
    uri: string,
    decimals: 6,              // Sugar usa 6 decimales
    totalSupply: number,      // 1,000,000,000,000,000 (1B tokens raw)
    programId: string,        // SPL Token program
  },
  quoteToken: {
    mint: string,             // SOL
    symbol: "SOL",
    decimals: 9,
  },

  // Direcciones
  creatorAddress: string,
  poolAddress: string,        // = bondingCurve
  configAddress: string,      // = bondingCurve

  // Mecánica de Precio (CURVE)
  curveType: "ConstantProduct",
  curveBaseReserves: number,  // 1,045,000,000,000,000 (1.045B virtual tokens, 6 decimals)
  curveQuoteReserves: number, // 30,000,000,000 (30 SOL virtual)

  // Estado de Custodia (VAULT)
  vaultBaseReserves: number,  // = totalSupply
  vaultQuoteReserves: 0,

  // Metas
  initialSaleSupply: number,
  graduationThreshold: number, // 85,000,000,000 (85 SOL)
}
```

**Ejemplo real:**
```json
{
  "protocol": "Sugar",
  "launchpad": "Sugar",
  "type": "CREATE",
  "user": "3xYk...",
  "baseToken": {
    "mint": "7YPV...",
    "name": "Sugar Token",
    "symbol": "SUGAR",
    "uri": "https://...",
    "decimals": 6,
    "totalSupply": 1000000000000000,
    "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  },
  "quoteToken": {
    "mint": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "decimals": 9
  },
  "creatorAddress": "3xYk...",
  "poolAddress": "5nKz...",
  "configAddress": "5nKz...",
  "curveType": "ConstantProduct",
  "curveBaseReserves": 1073000000000000,
  "curveQuoteReserves": 30000000000,
  "vaultBaseReserves": 1000000000000000,
  "vaultQuoteReserves": 0,
  "initialSaleSupply": 1000000000000000,
  "graduationThreshold": 85000000000,
  "signature": "...",
  "slot": 384000000,
  "timestamp": 1764000000,
  "idx": "0-0"
}
```

---

### BUY / SELL (TradeEvent)

Sugar emite eventos `TradeEvent` con reservas post-trade incluidas.

```typescript
{
  protocol: "Sugar",
  launchpad: "Sugar",
  type: "BUY" | "SELL",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  user: string,

  inputToken: {
    mint: string,
    amountRaw: string,
    amount: number,
    decimals: number,
  },
  outputToken: {
    mint: string,
    amountRaw: string,
    amount: number,
    decimals: number,
  },

  // Reservas post-trade (desde IDL event)
  curveQuoteReserves: number,     // virtualSolReserves
  curveBaseReserves: number,      // virtualTokenReserves
  vaultQuoteReserves: number,     // realSolReserves
  vaultBaseReserves: number,      // realTokenReserves
}
```

---

### COMPLETE

```typescript
{
  protocol: "Sugar",
  launchpad: "Sugar",
  type: "COMPLETE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  poolAddress: string,
  user: string,
}
```

---

### MIGRATE

```typescript
{
  protocol: "Sugar",
  launchpad: "Sugar",
  type: "MIGRATE",
  signature: string,
  slot: number,
  timestamp: number,
  idx: string,

  baseMint: string,
  quoteMint: string,
  pool: string,
  poolAddress: string,
}
```

---

## Resumen de Todas las Plataformas

### Tabla Comparativa

| Plataforma | Program ID | Decimales | Curva | Graduation | Token Program |
|------------|------------|-----------|-------|------------|---------------|
| **Pumpfun** | `6EF8rr...` | 6 | ConstantProduct | 85 SOL | SPL / Token-2022 |
| **Meteora DBC** | `dbcij3...` | 6 | DynamicBondingCurve | Configurable | SPL |
| **Raydium LCP** | `LanMV9...` | 6 | ConstantProduct | Configurable | SPL |
| **Boopfun** | `boop8h...` | 9 | ConstantProduct | 85 SOL | SPL |
| **Moonit** | `MoonCV...` | 9 | **LinearV1** | 500 SOL mcap | SPL |
| **Heaven** | `HEAVEN...` | 9 | ConstantProduct | ~85 SOL | SPL |
| **Sugar** | `deus4B...` | 6 | ConstantProduct | 85 SOL | SPL |

### Eventos Soportados por Plataforma

| Plataforma | CREATE | BUY | SELL | COMPLETE | MIGRATE |
|------------|--------|-----|------|----------|---------|
| **Pumpfun** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Meteora DBC** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Raydium LCP** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Boopfun** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Moonit** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Heaven** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Sugar** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Tipos de Curva

| Tipo | Descripción | Plataformas |
|------|-------------|-------------|
| **ConstantProduct** | Curva AMM x * y = k (precio aumenta exponencialmente) | Pumpfun, Raydium, Boopfun, Heaven, Sugar |
| **DynamicBondingCurve** | Curva segmentada con hasta 16 rangos de precio | Meteora DBC |
| **LinearV1** | Precio aumenta linealmente con tokens vendidos | Moonit |

### Formato de CREATE Event

| Plataforma | Formato | Campos Agrupados |
|------------|---------|------------------|
| **Pumpfun** | MemeEvent (legacy) | No - campos planos |
| **Raydium LCP** | MemeEvent (legacy) | No - campos planos |
| **Meteora DBC** | UnifiedCreateEvent | Sí - baseToken, quoteToken, Curve/Vault |
| **Boopfun** | UnifiedCreateEvent | Sí - baseToken, quoteToken, Curve/Vault |
| **Moonit** | UnifiedCreateEvent | Sí - baseToken, quoteToken, Curve/Vault |
| **Heaven** | UnifiedCreateEvent | Sí - baseToken, quoteToken, Curve/Vault |
| **Sugar** | UnifiedCreateEvent | Sí - baseToken, quoteToken, Curve/Vault |

### Program IDs Completos

```typescript
const MEME_LAUNCHPAD_PROGRAMS = {
  PUMPFUN: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
  METEORA_DBC: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN',
  RAYDIUM_LCP: 'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj',
  BOOPFUN: 'boop8hVGQGqehUK2iVEMEnMrL5RbjywRzHKBmBE7ry4',
  MOONIT: 'MoonCVVNZFSYkqNXP6bxHLPL6QQJiMagDL3qcqUQTrG',
  HEAVEN: 'HEAVENoP2qxoeuF8Dj2oT1GHEnu49U5mJYkdeC8BAX2o',
  SUGAR: 'deus4Bvftd5QKcEkE5muQaWGWDoma8GrySvPFrBPjhS',
};
```
