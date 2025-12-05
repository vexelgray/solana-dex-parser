/**
 * IDL exports for Solana program decoders
 *
 * These IDLs are sourced from https://github.com/bitquery/solana-idl-lib
 * and used by @coral-xyz/anchor BorshCoder for type-safe instruction decoding.
 */

// Launchpad IDLs
import PumpfunIdl from './pumpfun.json';
import BoopfunIdl from './boopfun.json';
import HeavenIdl from './heaven.json';
import MoonitIdl from './moonit.json';
import SugarIdl from './sugar.json';
import RaydiumLaunchpadIdl from './raydium-launchpad.json';
import MeteoraDbcIdl from './meteora-dbc.json';

// AMM IDLs
import PumpswapIdl from './pumpswap.json';
import MeteoraDAMMV1Idl from './meteora-damm-v1.json';
import MeteoraDAMMV2Idl from './meteora-damm-v2.json';
import MeteoraDVIdl from './meteora-dv.json';
import RaydiumCPMMIdl from './raydium-cpmm.json';
import RaydiumCLMMIdl from './raydium-clmm.json';
import RaydiumAMMV4Idl from './raydium-amm-v4.json';

// Export all IDLs
export {
  // Launchpads
  PumpfunIdl,
  BoopfunIdl,
  HeavenIdl,
  MoonitIdl,
  SugarIdl,
  RaydiumLaunchpadIdl,
  MeteoraDbcIdl,
  // AMMs
  PumpswapIdl,
  MeteoraDAMMV1Idl,
  MeteoraDAMMV2Idl,
  MeteoraDVIdl,
  RaydiumCPMMIdl,
  RaydiumCLMMIdl,
  RaydiumAMMV4Idl,
};
