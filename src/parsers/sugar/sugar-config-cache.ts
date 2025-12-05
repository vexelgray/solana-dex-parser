import { Connection, PublicKey } from '@solana/web3.js';

/**
 * SugarConfigCache - In-memory cache for Sugar State account data
 *
 * Sugar uses a global State account that stores the default bonding curve parameters
 * including initial_virtual_token_reserve and initial_virtual_sol_reserve.
 *
 * This cache stores the State data so that when processing CREATE events,
 * we can use the actual configured values instead of hardcoded constants.
 *
 * State account layout (from IDL):
 * - 8 bytes: Anchor discriminator
 * - 1 byte: bump
 * - 1 byte: version
 * - StateDataV1:
 *   - 1 byte: initialized (bool)
 *   - 32 bytes: authority
 *   - 32 bytes: pending_authority
 *   - 32 bytes: wrapper_mint
 *   - 32 bytes: fee_receiver
 *   - 8 bytes: fee_bps
 *   - 8 bytes: initial_virtual_token_reserve
 *   - 8 bytes: initial_virtual_sol_reserve
 *   - ... more fields
 */

// State account discriminator (from IDL: [216, 146, 107, 94, 104, 75, 182, 177])
const STATE_DISCRIMINATOR = Buffer.from([216, 146, 107, 94, 104, 75, 182, 177]);

// Offsets for State account fields
const FEE_BPS_OFFSET = 8 + 1 + 1 + 1 + 32 + 32 + 32 + 32; // 139
const INITIAL_VIRTUAL_TOKEN_RESERVE_OFFSET = FEE_BPS_OFFSET + 8; // 147
const INITIAL_VIRTUAL_SOL_RESERVE_OFFSET = INITIAL_VIRTUAL_TOKEN_RESERVE_OFFSET + 8; // 155

// Minimum account size to read initial reserves
const MIN_ACCOUNT_SIZE = INITIAL_VIRTUAL_SOL_RESERVE_OFFSET + 8; // 163

export interface SugarConfigData {
  stateAddress: string;
  feeBps: bigint;
  initialVirtualTokenReserve: bigint;
  initialVirtualSolReserve: bigint;
  // Calculated values
  totalSupply: bigint; // Derived from initial token reserve (typically same value)
  graduationThreshold: bigint; // Calculated based on bonding curve math
  // Timestamps for cache management
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * Input for setting config data (without timestamps)
 */
export interface SugarConfigInput {
  stateAddress: string;
  feeBps: bigint;
  initialVirtualTokenReserve: bigint;
  initialVirtualSolReserve: bigint;
}

class SugarConfigCacheClass {
  private cache: Map<string, SugarConfigData> = new Map();

  // Maximum cache size
  private readonly MAX_CACHE_SIZE = 100;

  // Cache TTL in milliseconds (24 hours)
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  // Default values (from actual Sugar State account: 4Sycg5ZYKh5pxYz86JwXU76q7LpmVuyi5aMQj96mNrJ5)
  private readonly DEFAULT_INITIAL_VIRTUAL_TOKEN_RESERVE = BigInt('1045000000000000'); // 1.045B tokens
  private readonly DEFAULT_INITIAL_VIRTUAL_SOL_RESERVE = BigInt('29800000000'); // 29.8 SOL
  private readonly DEFAULT_TOTAL_SUPPLY = BigInt('1000000000000000'); // 1B tokens
  private readonly DEFAULT_GRADUATION_THRESHOLD = BigInt('662222222222'); // ~662.22 SOL

  /**
   * Store config data in cache
   */
  set(stateAddress: string, input: SugarConfigInput): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const now = Date.now();

    // Calculate graduation threshold based on bonding curve math
    // Sugar graduates when real_sol_reserve reaches a certain threshold
    // For a standard constant product curve with these initial reserves,
    // graduation happens around 85 SOL
    const graduationThreshold = this.calculateGraduationThreshold(
      input.initialVirtualTokenReserve,
      input.initialVirtualSolReserve
    );

    this.cache.set(stateAddress, {
      ...input,
      totalSupply: this.DEFAULT_TOTAL_SUPPLY,
      graduationThreshold,
      createdAt: now,
      lastAccessedAt: now,
    });
  }

  /**
   * Get config data from cache
   */
  get(stateAddress: string): SugarConfigData | undefined {
    const data = this.cache.get(stateAddress);
    if (data) {
      data.lastAccessedAt = Date.now();
      return data;
    }
    return undefined;
  }

  /**
   * Get default config values (when State account is not available)
   */
  getDefaults(): Omit<SugarConfigData, 'stateAddress' | 'createdAt' | 'lastAccessedAt'> {
    return {
      feeBps: BigInt(100), // 1%
      initialVirtualTokenReserve: this.DEFAULT_INITIAL_VIRTUAL_TOKEN_RESERVE,
      initialVirtualSolReserve: this.DEFAULT_INITIAL_VIRTUAL_SOL_RESERVE,
      totalSupply: this.DEFAULT_TOTAL_SUPPLY,
      graduationThreshold: this.DEFAULT_GRADUATION_THRESHOLD,
    };
  }

  /**
   * Check if config exists in cache
   */
  has(stateAddress: string): boolean {
    return this.cache.has(stateAddress);
  }

  /**
   * Fetch config data from RPC and populate cache
   *
   * @param connection Solana RPC connection
   * @param stateAddress The State account address
   * @returns The config data, or undefined if account not found or invalid
   */
  async fetchFromRpc(connection: Connection, stateAddress: string): Promise<SugarConfigData | undefined> {
    // Check cache first
    const cached = this.get(stateAddress);
    if (cached) return cached;

    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(stateAddress));
      if (!accountInfo || accountInfo.data.length < MIN_ACCOUNT_SIZE) {
        return undefined;
      }

      const data = accountInfo.data;

      // Verify discriminator
      if (!data.subarray(0, 8).equals(STATE_DISCRIMINATOR)) {
        return undefined;
      }

      // Parse account data
      const configData = this.decodeStateAccount(stateAddress, data);
      if (!configData) return undefined;

      // Store in cache
      this.set(stateAddress, configData);

      return this.get(stateAddress);
    } catch {
      return undefined;
    }
  }

  /**
   * Decode State account data
   */
  private decodeStateAccount(stateAddress: string, data: Buffer): SugarConfigInput | null {
    try {
      const feeBps = data.readBigUInt64LE(FEE_BPS_OFFSET);
      const initialVirtualTokenReserve = data.readBigUInt64LE(INITIAL_VIRTUAL_TOKEN_RESERVE_OFFSET);
      const initialVirtualSolReserve = data.readBigUInt64LE(INITIAL_VIRTUAL_SOL_RESERVE_OFFSET);

      return {
        stateAddress,
        feeBps,
        initialVirtualTokenReserve,
        initialVirtualSolReserve,
      };
    } catch {
      return null;
    }
  }

  /**
   * Calculate graduation threshold based on bonding curve parameters
   *
   * Sugar uses a constant product curve where:
   * - Initial virtual SOL reserve: 30 SOL
   * - Initial virtual token reserve: 1.073B tokens
   * - Total supply for sale: 1B tokens
   *
   * The graduation threshold is when all tokens are sold.
   * Using AMM math: k = virtualSol * virtualToken
   * When all 1B tokens are sold: newVirtualToken = 1.073B - 1B = 73M
   * newVirtualSol = k / newVirtualToken
   * realSolCollected = newVirtualSol - initialVirtualSol
   *
   * This typically results in ~85 SOL for standard parameters.
   */
  private calculateGraduationThreshold(virtualToken: bigint, virtualSol: bigint): bigint {
    // k = virtualSol * virtualToken
    const k = virtualSol * virtualToken;

    // Tokens remaining after selling 1B (total supply)
    const totalSupply = this.DEFAULT_TOTAL_SUPPLY;
    const tokensRemaining = virtualToken - totalSupply;

    if (tokensRemaining <= 0n) {
      return this.DEFAULT_GRADUATION_THRESHOLD;
    }

    // New virtual SOL after all tokens sold
    const newVirtualSol = k / tokensRemaining;

    // Real SOL collected = new virtual - initial virtual
    const realSolCollected = newVirtualSol - virtualSol;

    return realSolCollected > 0n ? realSolCollected : this.DEFAULT_GRADUATION_THRESHOLD;
  }

  /**
   * Evict the oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, data] of this.cache) {
      if (data.lastAccessedAt < oldestTime) {
        oldestTime = data.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const SugarConfigCache = new SugarConfigCacheClass();
