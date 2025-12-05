import { Connection } from '@solana/web3.js';
import { MeteoraDBCConfigData } from './meteora-dbc-config-cache';
/**
 * Callback for when config data is fetched
 */
export type ConfigFetchedCallback = (configAddress: string, data: MeteoraDBCConfigData | null) => void;
/**
 * Options for the background config fetcher
 */
export interface BackgroundConfigFetcherOptions {
    /** Solana RPC connection */
    connection: Connection;
    /** Batch size for RPC calls (default: 100) */
    batchSize?: number;
    /** Interval in ms between batch processing (default: 100) */
    batchIntervalMs?: number;
    /** Maximum queue size (default: 10000) */
    maxQueueSize?: number;
    /** Callback when config is fetched (optional) */
    onConfigFetched?: ConfigFetchedCallback;
    /** Callback for errors (optional) */
    onError?: (error: Error, configAddresses: string[]) => void;
}
/**
 * BackgroundConfigFetcher - Non-blocking background worker for fetching Meteora DBC configs
 *
 * This class provides a fire-and-forget interface for fetching config data.
 * The main thread can call `queueFetch(address)` without awaiting - the fetch
 * happens in the background and results are stored in the global cache.
 *
 * Usage:
 * ```typescript
 * const fetcher = new BackgroundConfigFetcher({
 *   connection,
 *   onConfigFetched: (addr, data) => {
 *     console.log('Config fetched:', addr, data?.migrationQuoteThreshold);
 *   }
 * });
 *
 * fetcher.start();
 *
 * // In your gRPC handler (non-blocking):
 * fetcher.queueFetch(platformConfigAddress);
 *
 * // When done:
 * fetcher.stop();
 * ```
 */
export declare class BackgroundConfigFetcher {
    private connection;
    private batchSize;
    private batchIntervalMs;
    private maxQueueSize;
    private onConfigFetched?;
    private onError?;
    private queue;
    private processing;
    private intervalId;
    private isRunning;
    private stats;
    constructor(options: BackgroundConfigFetcherOptions);
    /**
     * Start the background worker
     */
    start(): void;
    /**
     * Stop the background worker
     */
    stop(): void;
    /**
     * Queue a config address for background fetching (non-blocking)
     * Returns immediately without waiting for the fetch
     *
     * @param configAddress The config account address to fetch
     * @returns true if queued, false if already cached or queue full
     */
    queueFetch(configAddress: string): boolean;
    /**
     * Queue multiple config addresses for background fetching (non-blocking)
     *
     * @param configAddresses Array of config account addresses
     * @returns Number of addresses actually queued
     */
    queueFetchMultiple(configAddresses: string[]): number;
    /**
     * Get current statistics
     */
    getStats(): {
        queued: number;
        fetched: number;
        errors: number;
        cacheHits: number;
        pendingInQueue: number;
    };
    /**
     * Check if the worker is running
     */
    get running(): boolean;
    /**
     * Get number of pending items in queue
     */
    get pendingCount(): number;
    /**
     * Process a batch of queued addresses
     * Called by the interval timer
     */
    private processBatch;
    /**
     * Fetch a batch of configs from RPC
     */
    private fetchBatch;
    /**
     * Force process all pending items immediately
     * Returns a promise that resolves when all items are processed
     * (Use this for graceful shutdown)
     */
    flush(): Promise<void>;
}
/**
 * Helper function to enrich a MemeEvent with config data from cache
 * Call this after the background fetcher has had time to populate the cache
 *
 * @param event The MemeEvent to enrich
 * @returns The enriched event (mutates original)
 */
export declare function enrichMemeEventWithConfig(event: {
    type?: string;
    protocol?: string;
    platformConfig?: string;
    totalQuoteFundRaising?: number;
    virtualSolReserves?: number;
    tokenTotalSupply?: number;
}): boolean;
