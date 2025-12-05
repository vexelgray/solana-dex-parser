import { Connection, PublicKey } from '@solana/web3.js';

/**
 * MoonitConfigCache - In-memory cache for Moonit CurveAccount data
 *
 * Moonit uses a linear bonding curve (LinearV1) rather than constant product.
 * Each token has its own CurveAccount with the curve parameters.
 *
 * CurveAccount layout (from IDL):
 * - 8 bytes: Anchor discriminator
 * - 8 bytes: totalSupply (u64)
 * - 8 bytes: curveAmount (u64) - tokens remaining in curve
 * - 32 bytes: mint (publicKey)
 * - 1 byte: decimals (u8)
 * - 1 byte: collateralCurrency (enum: Sol=0)
 * - 1 byte: curveType (enum: LinearV1=0)
 * - 8 bytes: marketcapThreshold (u64) - graduation threshold
 * - 1 byte: marketcapCurrency (enum: Sol=0)
 * - 8 bytes: migrationFee (u64)
 * - 4 bytes: coefB (u32) - linear curve coefficient
 * - 1 byte: bump (u8)
 */

// CurveAccount discriminator
const CURVE_ACCOUNT_DISCRIMINATOR = Buffer.from([8, 91, 83, 28, 132, 216, 248, 22]);

// Field offsets for CurveAccount
const TOTAL_SUPPLY_OFFSET = 8;
const CURVE_AMOUNT_OFFSET = 16;
const MINT_OFFSET = 24;
const DECIMALS_OFFSET = 56;
const COLLATERAL_CURRENCY_OFFSET = 57;
const CURVE_TYPE_OFFSET = 58;
const MARKETCAP_THRESHOLD_OFFSET = 59;
const MARKETCAP_CURRENCY_OFFSET = 67;
const MIGRATION_FEE_OFFSET = 68;
const COEF_B_OFFSET = 76;
const BUMP_OFFSET = 80;

// Minimum account size
const MIN_CURVE_ACCOUNT_SIZE = 81;

export interface MoonitCurveData {
  curveAddress: string;
  mint: string;
  totalSupply: bigint;
  curveAmount: bigint;
  decimals: number;
  collateralCurrency: 'SOL';
  curveType: 'LinearV1';
  marketcapThreshold: bigint;
  marketcapCurrency: 'SOL';
  migrationFee: bigint;
  coefB: number;
  // Timestamps for cache management
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * Input for setting curve data (without timestamps)
 */
export interface MoonitCurveInput {
  curveAddress: string;
  mint: string;
  totalSupply: bigint;
  curveAmount: bigint;
  decimals: number;
  collateralCurrency: 'SOL';
  curveType: 'LinearV1';
  marketcapThreshold: bigint;
  marketcapCurrency: 'SOL';
  migrationFee: bigint;
  coefB: number;
}

class MoonitConfigCacheClass {
  private cache: Map<string, MoonitCurveData> = new Map();

  // Maximum cache size
  private readonly MAX_CACHE_SIZE = 100;

  // Cache TTL in milliseconds (24 hours)
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  // Default values from actual Moonit CurveAccount analysis
  private readonly DEFAULT_TOTAL_SUPPLY = BigInt('1000000000000000000'); // 1B tokens (9 decimals)
  private readonly DEFAULT_DECIMALS = 9;
  private readonly DEFAULT_MARKETCAP_THRESHOLD = BigInt('345000000000'); // 345 SOL
  private readonly DEFAULT_MIGRATION_FEE = BigInt('500000000'); // 0.5 SOL
  private readonly DEFAULT_COEF_B = 25;

  /**
   * Store curve data in cache
   */
  set(curveAddress: string, input: MoonitCurveInput): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const now = Date.now();

    this.cache.set(curveAddress, {
      ...input,
      createdAt: now,
      lastAccessedAt: now,
    });
  }

  /**
   * Get curve data from cache
   */
  get(curveAddress: string): MoonitCurveData | undefined {
    const data = this.cache.get(curveAddress);
    if (data) {
      data.lastAccessedAt = Date.now();
      return data;
    }
    return undefined;
  }

  /**
   * Get default config values (when CurveAccount is not available)
   */
  getDefaults(): Omit<MoonitCurveData, 'curveAddress' | 'mint' | 'createdAt' | 'lastAccessedAt'> {
    return {
      totalSupply: this.DEFAULT_TOTAL_SUPPLY,
      curveAmount: this.DEFAULT_TOTAL_SUPPLY, // All tokens in curve initially
      decimals: this.DEFAULT_DECIMALS,
      collateralCurrency: 'SOL',
      curveType: 'LinearV1',
      marketcapThreshold: this.DEFAULT_MARKETCAP_THRESHOLD,
      marketcapCurrency: 'SOL',
      migrationFee: this.DEFAULT_MIGRATION_FEE,
      coefB: this.DEFAULT_COEF_B,
    };
  }

  /**
   * Check if curve data exists in cache
   */
  has(curveAddress: string): boolean {
    return this.cache.has(curveAddress);
  }

  /**
   * Fetch curve data from RPC and populate cache
   *
   * @param connection Solana RPC connection
   * @param curveAddress The CurveAccount address
   * @returns The curve data, or undefined if account not found or invalid
   */
  async fetchFromRpc(connection: Connection, curveAddress: string): Promise<MoonitCurveData | undefined> {
    // Check cache first
    const cached = this.get(curveAddress);
    if (cached) return cached;

    try {
      const accountInfo = await connection.getAccountInfo(new PublicKey(curveAddress));
      if (!accountInfo || accountInfo.data.length < MIN_CURVE_ACCOUNT_SIZE) {
        return undefined;
      }

      const data = accountInfo.data;

      // Verify discriminator
      if (!data.subarray(0, 8).equals(CURVE_ACCOUNT_DISCRIMINATOR)) {
        return undefined;
      }

      // Parse account data
      const curveData = this.decodeCurveAccount(curveAddress, data);
      if (!curveData) return undefined;

      // Store in cache
      this.set(curveAddress, curveData);

      return this.get(curveAddress);
    } catch {
      return undefined;
    }
  }

  /**
   * Decode CurveAccount data
   */
  private decodeCurveAccount(curveAddress: string, data: Buffer): MoonitCurveInput | null {
    try {
      const totalSupply = data.readBigUInt64LE(TOTAL_SUPPLY_OFFSET);
      const curveAmount = data.readBigUInt64LE(CURVE_AMOUNT_OFFSET);
      const mint = new PublicKey(data.subarray(MINT_OFFSET, MINT_OFFSET + 32)).toBase58();
      const decimals = data.readUInt8(DECIMALS_OFFSET);
      const collateralCurrency = data.readUInt8(COLLATERAL_CURRENCY_OFFSET) === 0 ? 'SOL' : 'SOL';
      const curveType = data.readUInt8(CURVE_TYPE_OFFSET) === 0 ? 'LinearV1' : 'LinearV1';
      const marketcapThreshold = data.readBigUInt64LE(MARKETCAP_THRESHOLD_OFFSET);
      const marketcapCurrency = data.readUInt8(MARKETCAP_CURRENCY_OFFSET) === 0 ? 'SOL' : 'SOL';
      const migrationFee = data.readBigUInt64LE(MIGRATION_FEE_OFFSET);
      const coefB = data.readUInt32LE(COEF_B_OFFSET);

      return {
        curveAddress,
        mint,
        totalSupply,
        curveAmount,
        decimals,
        collateralCurrency: collateralCurrency as 'SOL',
        curveType: curveType as 'LinearV1',
        marketcapThreshold,
        marketcapCurrency: marketcapCurrency as 'SOL',
        migrationFee,
        coefB,
      };
    } catch {
      return null;
    }
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
export const MoonitConfigCache = new MoonitConfigCacheClass();
