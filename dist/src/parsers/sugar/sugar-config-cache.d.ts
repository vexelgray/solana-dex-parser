import { Connection } from '@solana/web3.js';
export interface SugarConfigData {
    stateAddress: string;
    feeBps: bigint;
    initialVirtualTokenReserve: bigint;
    initialVirtualSolReserve: bigint;
    totalSupply: bigint;
    graduationThreshold: bigint;
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
declare class SugarConfigCacheClass {
    private cache;
    private readonly MAX_CACHE_SIZE;
    private readonly CACHE_TTL_MS;
    private readonly DEFAULT_INITIAL_VIRTUAL_TOKEN_RESERVE;
    private readonly DEFAULT_INITIAL_VIRTUAL_SOL_RESERVE;
    private readonly DEFAULT_TOTAL_SUPPLY;
    private readonly DEFAULT_GRADUATION_THRESHOLD;
    /**
     * Store config data in cache
     */
    set(stateAddress: string, input: SugarConfigInput): void;
    /**
     * Get config data from cache
     */
    get(stateAddress: string): SugarConfigData | undefined;
    /**
     * Get default config values (when State account is not available)
     */
    getDefaults(): Omit<SugarConfigData, 'stateAddress' | 'createdAt' | 'lastAccessedAt'>;
    /**
     * Check if config exists in cache
     */
    has(stateAddress: string): boolean;
    /**
     * Fetch config data from RPC and populate cache
     *
     * @param connection Solana RPC connection
     * @param stateAddress The State account address
     * @returns The config data, or undefined if account not found or invalid
     */
    fetchFromRpc(connection: Connection, stateAddress: string): Promise<SugarConfigData | undefined>;
    /**
     * Decode State account data
     */
    private decodeStateAccount;
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
    private calculateGraduationThreshold;
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
export declare const SugarConfigCache: SugarConfigCacheClass;
export {};
