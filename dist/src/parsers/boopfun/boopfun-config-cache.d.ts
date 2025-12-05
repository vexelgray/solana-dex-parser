import { Connection } from '@solana/web3.js';
export interface BoopfunConfigData {
    configAddress: string;
    virtualSolReserves: bigint;
    virtualTokenReserves: bigint;
    graduationTarget: bigint;
    graduationFee: bigint;
    dampingTerm: number;
    swapFeeBasisPoints: number;
    tokenForStakersBasisPoints: number;
    totalSupply: bigint;
    createdAt: number;
    lastAccessedAt: number;
}
/**
 * Input for setting config data (without timestamps)
 */
export interface BoopfunConfigInput {
    configAddress: string;
    virtualSolReserves: bigint;
    virtualTokenReserves: bigint;
    graduationTarget: bigint;
    graduationFee: bigint;
    dampingTerm: number;
    swapFeeBasisPoints: number;
    tokenForStakersBasisPoints: number;
}
declare class BoopfunConfigCacheClass {
    private cache;
    private readonly MAX_CACHE_SIZE;
    private readonly CACHE_TTL_MS;
    private readonly DEFAULT_VIRTUAL_SOL_RESERVES;
    private readonly DEFAULT_VIRTUAL_TOKEN_RESERVES;
    private readonly DEFAULT_TOTAL_SUPPLY;
    private readonly DEFAULT_GRADUATION_TARGET;
    private readonly DEFAULT_GRADUATION_FEE;
    private readonly DEFAULT_DAMPING_TERM;
    private readonly DEFAULT_SWAP_FEE_BASIS_POINTS;
    private readonly DEFAULT_TOKEN_FOR_STAKERS_BASIS_POINTS;
    /**
     * Store config data in cache
     */
    set(configAddress: string, input: BoopfunConfigInput): void;
    /**
     * Get config data from cache
     */
    get(configAddress: string): BoopfunConfigData | undefined;
    /**
     * Get default config values (when Config account is not available)
     */
    getDefaults(): Omit<BoopfunConfigData, 'configAddress' | 'createdAt' | 'lastAccessedAt'>;
    /**
     * Check if config exists in cache
     */
    has(configAddress: string): boolean;
    /**
     * Fetch config data from RPC and populate cache
     *
     * @param connection Solana RPC connection
     * @param configAddress The Config account address
     * @returns The config data, or undefined if account not found or invalid
     */
    fetchFromRpc(connection: Connection, configAddress: string): Promise<BoopfunConfigData | undefined>;
    /**
     * Decode Config account data
     * Handles the variable-length operators vec
     */
    private decodeConfigAccount;
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
export declare const BoopfunConfigCache: BoopfunConfigCacheClass;
export {};
