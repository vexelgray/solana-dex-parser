import { Connection } from '@solana/web3.js';
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
declare class MoonitConfigCacheClass {
    private cache;
    private readonly MAX_CACHE_SIZE;
    private readonly CACHE_TTL_MS;
    private readonly DEFAULT_TOTAL_SUPPLY;
    private readonly DEFAULT_DECIMALS;
    private readonly DEFAULT_MARKETCAP_THRESHOLD;
    private readonly DEFAULT_MIGRATION_FEE;
    private readonly DEFAULT_COEF_B;
    /**
     * Store curve data in cache
     */
    set(curveAddress: string, input: MoonitCurveInput): void;
    /**
     * Get curve data from cache
     */
    get(curveAddress: string): MoonitCurveData | undefined;
    /**
     * Get default config values (when CurveAccount is not available)
     */
    getDefaults(): Omit<MoonitCurveData, 'curveAddress' | 'mint' | 'createdAt' | 'lastAccessedAt'>;
    /**
     * Check if curve data exists in cache
     */
    has(curveAddress: string): boolean;
    /**
     * Fetch curve data from RPC and populate cache
     *
     * @param connection Solana RPC connection
     * @param curveAddress The CurveAccount address
     * @returns The curve data, or undefined if account not found or invalid
     */
    fetchFromRpc(connection: Connection, curveAddress: string): Promise<MoonitCurveData | undefined>;
    /**
     * Decode CurveAccount data
     */
    private decodeCurveAccount;
    /**
     * Evict the oldest cache entry
     */
    private evictOldest;
    /**
     * Clear all cached data
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
}
export declare const MoonitConfigCache: MoonitConfigCacheClass;
export {};
