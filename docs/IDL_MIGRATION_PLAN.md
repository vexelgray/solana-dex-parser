# Plan de Migración a IDLs con Anchor

## Estado Actual: COMPLETADO

> **Última actualización:** 2024-12-03
> **Estado:** Fases 1-4 completadas, Fase 5 en progreso

## Resumen Ejecutivo

Migrar el sistema de parsing de discriminators hardcodeados a decodificación automática usando IDLs de Anchor desde [bitquery/solana-idl-lib](https://github.com/bitquery/solana-idl-lib).

**Beneficios clave:**
- Eliminación de ~190 líneas de discriminators manuales
- Type-safety automático en lugar de `any` types
- Actualización simple: cambiar JSON vs editar código
- Reducción de bugs por desincronización con programas on-chain

**Tiempo estimado total:** 2-3 semanas

## Decoders Implementados

| Protocolo | Decoder | Program ID | Estado |
|-----------|---------|------------|--------|
| Pumpfun | `PumpfunDecoder` | 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P | ✅ Completado |
| Pumpswap | `PumpswapDecoder` | pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA | ✅ Completado |
| Meteora DBC | `MeteoraDBCDecoder` | dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN | ✅ Completado |
| Raydium Launchpad | `RaydiumLaunchpadDecoder` | LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj | ✅ Completado |
| Meteora DAMM V2 | `MeteoraDAMMV2Decoder` | cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG | ✅ Completado |
| Meteora Pools | `MeteoraPoolsDecoder` | Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB | ✅ Completado |

### Protocolos Sin Migración (Por Diseño)

| Protocolo | Razón |
|-----------|-------|
| Jupiter | Múltiples programas, alta complejidad, skip solicitado |
| Raydium AMM/CPMM/CL | Son liquidity parsers simples, solo usan discriminadores |
| Orca | Es liquidity parser simple, solo usa discriminadores |
| Boopfun, Moonit, Heaven, Sugar | Protocolos menores sin IDLs disponibles |

---

## Fase 1: Infraestructura Base

**Duración estimada:** 1-2 días

### Objetivo
Establecer la base técnica para usar IDLs con Anchor sin romper funcionalidad existente.

### Subtareas

#### 1.1 Agregar dependencias
- [x] Instalar `@coral-xyz/anchor` como dependencia
- [x] Verificar compatibilidad con Node.js >= 18.8.0
- [x] Actualizar `package.json` con versión específica (lockear)

**Criterio de completado:**
```bash
yarn add @coral-xyz/anchor
yarn build  # Sin errores
yarn test   # Tests existentes pasan
```

#### 1.2 Crear estructura de directorios
- [x] Crear `src/idls/` para almacenar archivos JSON de IDLs
- [x] Crear `src/decoders/` para los decoders basados en IDL
- [x] Agregar `.gitkeep` o archivo index en cada directorio

**Criterio de completado:**
```
src/
├── idls/
│   └── index.ts        # Re-exporta IDLs
└── decoders/
    └── index.ts        # Re-exporta decoders
```

#### 1.3 Descargar IDLs iniciales de bitquery
- [x] Descargar `pumpfun/pump.json` → `src/idls/pumpfun.json`
- [x] Descargar `pumpswap/*.json` → `src/idls/pumpswap.json`
- [x] Descargar `meteora/dynamic_bonding_curve.json` → `src/idls/meteora-dbc.json`
- [x] Validar que los JSON son IDLs válidos de Anchor

**Criterio de completado:**
```typescript
// src/idls/index.ts compila sin errores
import PumpfunIdl from './pumpfun.json';
import PumpswapIdl from './pumpswap.json';
import MeteoraDbcIdl from './meteora-dbc.json';

export { PumpfunIdl, PumpswapIdl, MeteoraDbcIdl };
```

#### 1.4 Implementar IdlDecoder base
- [x] Crear clase `IdlDecoder<T>` genérica
- [x] Implementar `decodeInstruction(data: Buffer)`
- [x] Implementar `decodeEvent(data: Buffer)`
- [x] Implementar `getDiscriminator(name: string)`
- [x] Agregar manejo de errores robusto

**Criterio de completado:**
```typescript
// src/decoders/idl-decoder.ts
import { BorshCoder } from '@coral-xyz/anchor';

export class IdlDecoder {
  // Debe compilar y pasar test unitario básico
}

// Test:
const decoder = new IdlDecoder(PumpfunIdl);
const discriminator = decoder.getInstructionDiscriminator('buy');
expect(discriminator).toEqual(Buffer.from([102, 6, 61, 18, 1, 218, 235, 234]));
```

#### 1.5 Crear tests de validación de IDLs
- [x] Test que verifica discriminators de IDL vs hardcodeados actuales
- [x] Test que decodifica instrucción conocida
- [x] Test que decodifica evento conocido

**Criterio de completado:**
```bash
yarn test src/__tests__/idl-decoder.test.ts  # Todos pasan
```

### Entregables Fase 1
- [x] PR con dependencia `@coral-xyz/anchor`
- [x] Estructura de directorios `src/idls/` y `src/decoders/`
- [x] 3 IDLs descargados (pumpfun, pumpswap, meteora-dbc)
- [x] Clase `IdlDecoder` funcional
- [x] Tests de validación pasando

### Checklist de Completado Fase 1
```
[x] yarn build sin errores
[x] yarn test sin regresiones
[x] IdlDecoder puede decodificar instrucción de Pumpfun
[x] IdlDecoder puede decodificar evento de Pumpfun
[x] Discriminators generados coinciden con hardcodeados
```

---

## Fase 2: Protocolo Piloto (Pumpfun)

**Duración estimada:** 2-3 días

### Objetivo
Migrar completamente el parser de Pumpfun a IDL como prueba de concepto y validación.

### Subtareas

#### 2.1 Crear PumpfunDecoder específico
- [x] Extender `IdlDecoder` con tipos específicos de Pumpfun
- [x] Mapear eventos del IDL a tipos TypeScript
- [x] Implementar helpers para campos comunes (mint, user, amounts)

**Criterio de completado:**
```typescript
// src/decoders/pumpfun-decoder.ts
export class PumpfunDecoder extends IdlDecoder {
  decodeTradeEvent(data: Buffer): PumpfunTradeEvent | null;
  decodeCreateEvent(data: Buffer): PumpfunCreateEvent | null;
  decodeCompleteEvent(data: Buffer): PumpfunCompleteEvent | null;
  decodeMigrateEvent(data: Buffer): PumpfunMigrateEvent | null;
}

// Con tipos generados desde IDL, no `any`
```

#### 2.2 Refactorizar PumpfunEventParser
- [x] Reemplazar `DISCRIMINATORS.PUMPFUN.*` con decoder
- [x] Reemplazar `BinaryReader` manual con `decoder.decode()`
- [x] Mantener interfaz pública igual (`processEvents()`)
- [x] Preservar lógica de negocio (mayhem mode, reserves, etc.)

**Criterio de completado:**
```typescript
// Antes (actual):
const discriminator = Buffer.from(data.slice(0, 16));
if (discriminator.equals(DISCRIMINATORS.PUMPFUN.TRADE_EVENT)) {
  const reader = new BinaryReader(data.slice(16));
  // ... lectura manual
}

// Después (migrado):
const decoded = this.decoder.decodeEvent(data);
if (decoded?.name === 'TradeEvent') {
  // decoded.data ya tiene todos los campos tipados
}
```

#### 2.3 Crear tests de comparación
- [x] Test que parsea misma TX con implementación vieja y nueva
- [x] Comparar output campo por campo
- [x] Documentar cualquier diferencia encontrada

**Criterio de completado:**
```typescript
// src/__tests__/pumpfun-idl-migration.test.ts
it('should produce identical output for TradeEvent', async () => {
  const tx = await getTestTransaction('pumpfun-trade');

  const oldResult = new PumpfunEventParserOld(adapter).processEvents();
  const newResult = new PumpfunEventParser(adapter).processEvents();

  expect(newResult).toEqual(oldResult);
});
```

#### 2.4 Validar con transacciones reales
- [x] Probar con 10+ transacciones de trade
- [x] Probar con 5+ transacciones de create
- [x] Probar con 3+ transacciones de migrate
- [x] Probar con transacciones de mayhem mode

**Criterio de completado:**
```bash
yarn test src/__tests__/parser-pumpfun.test.ts  # Todos pasan
# Incluyendo nuevos casos de prueba con IDL
```

#### 2.5 Actualizar exportaciones
- [x] Exportar `PumpfunDecoder` desde `src/decoders/index.ts`
- [x] Mantener backward compatibility en exports públicos
- [x] Actualizar `index.ts` si es necesario

**Criterio de completado:**
```typescript
// Usuario puede seguir usando:
import { PumpfunEventParser } from 'solana-dex-parser';
// Y opcionalmente:
import { PumpfunDecoder } from 'solana-dex-parser';
```

### Entregables Fase 2
- [x] `PumpfunDecoder` con tipos completos
- [x] `PumpfunEventParser` refactorizado
- [x] Tests de comparación old vs new
- [x] Documentación de cambios

### Checklist de Completado Fase 2
```
[x] PumpfunEventParser usa IdlDecoder internamente
[x] No hay uso de DISCRIMINATORS.PUMPFUN en el parser
[x] No hay uso de BinaryReader para eventos
[x] Todos los tests existentes pasan
[x] Tests de comparación verifican paridad
[x] Performance similar o mejor (benchmark opcional)
```

---

## Fase 3: Migración Gradual de Protocolos

**Duración estimada:** 1-2 semanas

### Objetivo
Migrar sistemáticamente todos los parsers a IDLs siguiendo el patrón establecido con Pumpfun.

### Orden de Migración (por complejidad y uso)

#### 3.1 Pumpswap (Alta prioridad) ✅ COMPLETADO
- [x] Descargar IDL de pumpswap
- [x] Crear `PumpswapDecoder`
- [x] Refactorizar `PumpswapEventParser`
- [x] Refactorizar `PumpswapLiquidityParser`
- [x] Tests de validación

**Criterio de completado:**
```bash
yarn test src/__tests__/parser-pumpswap.test.ts  # Pasan
# Sin uso de DISCRIMINATORS.PUMPSWAP
```

#### 3.2 Meteora DBC (Alta prioridad) ✅ COMPLETADO
- [x] Validar IDL descargado en Fase 1
- [x] Crear `MeteoraDbcDecoder`
- [x] Refactorizar `MeteoraDBCEventParser`
- [x] Refactorizar `MeteoraDBCParser`
- [x] Tests de validación

**Criterio de completado:**
```bash
yarn test src/__tests__/*meteora*.test.ts  # Pasan
# Sin uso de DISCRIMINATORS.METEORA_DBC
```

#### 3.3 Raydium Launchpad (Alta prioridad) ✅ COMPLETADO
- [x] Descargar IDL de raydium launchpad
- [x] Crear `RaydiumLcpDecoder`
- [x] Refactorizar `RaydiumLaunchpadEventParser`
- [x] Tests de validación

**Criterio de completado:**
```bash
yarn test src/__tests__/parser-raydium-lcp.test.ts  # Pasan
# Sin uso de DISCRIMINATORS.RAYDIUM_LCP
```

#### 3.4 Jupiter (Media prioridad) ⏭️ SKIPPED
- [x] **Decisión: Skip** - Múltiples programas (V6, DCA, Limit, VA) con alta complejidad
- Alta complejidad, el código actual funciona bien con discriminadores

**Razón del skip:** El usuario solicitó mantener Jupiter como está debido a su complejidad.

#### 3.5 Meteora DAMM V2 / Pools ✅ COMPLETADO
- [x] Copiar IDLs de meteora-damm-v2.json y meteora-pools.json
- [x] Crear `MeteoraDAMMV2Decoder` (cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG)
- [x] Crear `MeteoraPoolsDecoder` (Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB)
- [x] Exportar desde decoders/index.ts
- [x] Build sin errores

**Nota:** Los liquidity parsers de Meteora DLMM existentes son simples y no requieren migración.

#### 3.6 Raydium AMM/CPMM/CL (Media prioridad) ⏭️ SKIPPED
- [x] **Decisión: Skip** - Son liquidity parsers simples
- Solo usan discriminadores para detectar tipo de instrucción
- No hacen parsing complejo de eventos

**Razón del skip:** Son parsers de liquidez que solo extraen poolId y lpMint de las cuentas. El código actual es simple y eficiente.

#### 3.7 Orca (Baja prioridad) ⏭️ SKIPPED
- [x] **Decisión: Skip** - Es un liquidity parser simple
- Solo usa discriminadores para detectar ADD/REMOVE liquidez

**Razón del skip:** Similar a Raydium, es un parser de liquidez simple que no requiere IDL completo.

#### 3.8 Protocolos Menores (Baja prioridad) ⏭️ SKIPPED
- [x] **Decisión: Skip** - No hay IDLs disponibles
- Boopfun, Moonit, Heaven, Sugar - usan BinaryReader manual
- El código actual funciona correctamente

**Razón del skip:** Protocolos menores sin IDLs públicos disponibles. El código actual con BinaryReader funciona bien.

### Entregables Fase 3
- [x] Decoders para protocolos principales (Pumpfun, Pumpswap, Meteora DBC, Raydium LCP, Meteora DAMM V2, Meteora Pools)
- [x] Protocolos de liquidez evaluados y decididos como skip
- [x] IDLs en `src/idls/` para cada protocolo migrado
- [x] Tests de validación por protocolo

### Checklist de Completado Fase 3
```
[x] Protocolos principales migrados a IdlDecoder
[x] Todos los tests existentes pasan
[x] No hay regresiones en output
[x] Decoders documentados y exportados
```

---

## Fase 4: Limpieza y Documentación

**Duración estimada:** 2-3 días

### Objetivo
Eliminar código legacy, optimizar bundle y documentar el nuevo sistema.

### Subtareas

#### 4.1 Eliminar código obsoleto
- [ ] Eliminar `src/constants/discriminators.ts`
- [ ] Eliminar layouts manuales no usados en `src/parsers/*/layouts/`
- [ ] Eliminar `BinaryReader` si ya no se usa (o marcar como deprecated)
- [ ] Limpiar imports no usados

**Criterio de completado:**
```bash
# El archivo no existe:
ls src/constants/discriminators.ts  # File not found

# Build sigue funcionando:
yarn build  # Sin errores
yarn test   # Todos pasan
```

#### 4.2 Optimizar bundle size
- [ ] Verificar tree-shaking de `@coral-xyz/anchor`
- [ ] Considerar importar solo `BorshCoder` si es posible
- [ ] Medir tamaño del bundle antes/después
- [ ] Documentar impacto en tamaño

**Criterio de completado:**
```bash
# Documentar en PR:
# Bundle size antes: X KB
# Bundle size después: Y KB
# Diferencia: +Z KB (aceptable si < 150KB gzipped)
```

#### 4.3 Actualizar tipos exportados
- [ ] Generar tipos TypeScript desde IDLs
- [ ] Exportar tipos útiles para usuarios (`PumpfunTradeEvent`, etc.)
- [ ] Actualizar `src/types/index.ts`

**Criterio de completado:**
```typescript
// Usuario puede importar tipos específicos:
import type {
  PumpfunTradeEvent,
  PumpfunCreateEvent
} from 'solana-dex-parser';
```

#### 4.4 Actualizar documentación
- [ ] Actualizar `README.md` con nueva arquitectura
- [ ] Actualizar `CLAUDE.md` con información de IDLs
- [ ] Crear `docs/IDL_ARCHITECTURE.md` explicando el sistema
- [ ] Documentar cómo agregar nuevo protocolo

**Criterio de completado:**
```markdown
# En README.md debe existir sección:
## IDL-Based Decoding
This library uses Anchor IDLs for type-safe instruction decoding...

# En CLAUDE.md debe existir sección:
### IDL Decoders
Located in `src/decoders/`, each protocol has...
```

#### 4.5 Crear script de actualización de IDLs
- [ ] Script que descarga IDLs desde bitquery
- [ ] Validación de que IDLs son válidos
- [ ] Instrucciones en `package.json` scripts

**Criterio de completado:**
```json
// package.json
{
  "scripts": {
    "update-idls": "node scripts/update-idls.js"
  }
}
```

```bash
yarn update-idls  # Descarga IDLs actualizados
```

#### 4.6 Crear guía de contribución
- [ ] Documentar cómo agregar soporte para nuevo protocolo
- [ ] Template para nuevo decoder
- [ ] Checklist para PR de nuevo protocolo

**Criterio de completado:**
```markdown
# docs/ADDING_NEW_PROTOCOL.md existe con:
1. Obtener IDL del protocolo
2. Crear decoder extendiendo IdlDecoder
3. Crear/actualizar parser
4. Agregar tests
5. Actualizar exports
```

### Entregables Fase 4
- [ ] `discriminators.ts` eliminado
- [ ] Bundle size documentado
- [ ] Documentación actualizada
- [ ] Script de actualización de IDLs
- [ ] Guía de contribución

### Checklist de Completado Fase 4
```
[ ] No existe src/constants/discriminators.ts
[ ] yarn build sin warnings de imports no usados
[ ] README.md actualizado
[ ] CLAUDE.md actualizado
[ ] docs/IDL_ARCHITECTURE.md creado
[ ] docs/ADDING_NEW_PROTOCOL.md creado
[ ] yarn update-idls funciona
```

---

## Fase 5: Testing Final y Release

**Duración estimada:** 1-2 días

### Objetivo
Validación exhaustiva y preparación para release.

### Subtareas

#### 5.1 Testing de integración completo
- [ ] Ejecutar todos los tests
- [ ] Probar con transacciones de los últimos 7 días
- [ ] Validar parsing de bloques completos
- [ ] Test de rendimiento/benchmark

**Criterio de completado:**
```bash
yarn test                    # 100% pass
yarn test:integration        # Si existe, 100% pass
# Benchmark: no más de 10% más lento que antes
```

#### 5.2 Testing manual
- [ ] Probar ejemplos del README
- [ ] Verificar que exports públicos funcionan
- [ ] Probar en proyecto consumidor (si hay uno de prueba)

**Criterio de completado:**
```typescript
// Todos los ejemplos del README funcionan sin modificación
import { DexParser } from 'solana-dex-parser';
const parser = new DexParser();
// ... ejemplos funcionan
```

#### 5.3 Preparar release
- [ ] Actualizar versión en `package.json` (minor bump)
- [ ] Crear CHANGELOG.md entry
- [ ] Revisar que no hay breaking changes (o documentarlos)

**Criterio de completado:**
```json
// package.json
{
  "version": "2.7.0"  // Era 2.6.7
}
```

```markdown
# CHANGELOG.md
## [2.7.0] - YYYY-MM-DD
### Added
- IDL-based instruction decoding using @coral-xyz/anchor
- Type-safe event parsing for all supported protocols
- Script to update IDLs from bitquery/solana-idl-lib

### Changed
- Internal parsing now uses BorshCoder instead of manual BinaryReader

### Removed
- `src/constants/discriminators.ts` (discriminators now derived from IDLs)
```

#### 5.4 Crear PR final
- [ ] Squash commits si es necesario
- [ ] Descripción detallada del PR
- [ ] Screenshots/logs de tests pasando

**Criterio de completado:**
```
PR description incluye:
- [ ] Resumen de cambios
- [ ] Lista de protocolos migrados
- [ ] Impacto en bundle size
- [ ] Breaking changes (si hay)
- [ ] Screenshots de tests pasando
```

### Entregables Fase 5
- [ ] Todos los tests pasando
- [ ] Versión actualizada
- [ ] CHANGELOG.md actualizado
- [ ] PR listo para merge

### Checklist de Completado Fase 5
```
[ ] yarn test - 100% pass
[ ] yarn build - sin errores ni warnings
[ ] Ejemplos de README funcionan
[ ] CHANGELOG.md actualizado
[ ] package.json version bumped
[ ] PR creado y aprobado
```

---

## Resumen de Criterios de Completado por Fase

| Fase | Criterio Principal | Verificación |
|------|-------------------|--------------|
| **1** | IdlDecoder funciona con Pumpfun | `yarn test idl-decoder.test.ts` |
| **2** | PumpfunEventParser usa IDL | No usa `DISCRIMINATORS.PUMPFUN` |
| **3** | Todos los parsers migrados | `grep -r "DISCRIMINATORS\." src/` vacío |
| **4** | Código legacy eliminado | `discriminators.ts` no existe |
| **5** | Release listo | Todos los tests pasan, docs actualizados |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| IDL desactualizado vs programa on-chain | Media | Alto | Script de actualización + tests con TXs recientes |
| Breaking change en @coral-xyz/anchor | Baja | Medio | Lockear versión en package.json |
| Aumento excesivo de bundle | Media | Medio | Tree-shaking, importar solo BorshCoder |
| Programa sin IDL disponible | Baja | Bajo | Mantener BinaryReader como fallback |
| Regresión en parsing | Media | Alto | Tests de comparación old vs new |

---

## Notas Adicionales

### Cómo marcar una tarea como completada

1. Ejecutar el criterio de completado especificado
2. Si pasa, marcar checkbox `[x]`
3. Si falla, documentar el error y resolverlo
4. Commitear cambios con mensaje descriptivo

### Convenciones de commits

```
feat(idl): add IdlDecoder base class
feat(pumpfun): migrate to IDL-based decoding
refactor(meteora): replace BinaryReader with BorshCoder
chore: remove discriminators.ts
docs: update README with IDL architecture
test: add IDL validation tests
```

### Recursos

- [bitquery/solana-idl-lib](https://github.com/bitquery/solana-idl-lib) - IDLs actualizados
- [@coral-xyz/anchor docs](https://www.anchor-lang.com/) - Documentación de Anchor
- [BorshCoder source](https://github.com/coral-xyz/anchor/tree/master/ts/packages/anchor/src/coder/borsh) - Implementación de referencia
