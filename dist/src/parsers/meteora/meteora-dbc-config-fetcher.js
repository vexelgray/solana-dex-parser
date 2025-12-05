"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundConfigFetcher = void 0;
exports.enrichMemeEventWithConfig = enrichMemeEventWithConfig;
const meteora_dbc_config_cache_1 = require("./meteora-dbc-config-cache");
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
class BackgroundConfigFetcher {
    constructor(options) {
        this.queue = new Set();
        this.processing = false;
        this.intervalId = null;
        this.isRunning = false;
        // Stats
        this.stats = {
            queued: 0,
            fetched: 0,
            errors: 0,
            cacheHits: 0,
        };
        this.connection = options.connection;
        this.batchSize = options.batchSize ?? 100;
        this.batchIntervalMs = options.batchIntervalMs ?? 100;
        this.maxQueueSize = options.maxQueueSize ?? 10000;
        this.onConfigFetched = options.onConfigFetched;
        this.onError = options.onError;
    }
    /**
     * Start the background worker
     */
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.intervalId = setInterval(() => this.processBatch(), this.batchIntervalMs);
    }
    /**
     * Stop the background worker
     */
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * Queue a config address for background fetching (non-blocking)
     * Returns immediately without waiting for the fetch
     *
     * @param configAddress The config account address to fetch
     * @returns true if queued, false if already cached or queue full
     */
    queueFetch(configAddress) {
        // Skip if already in cache
        if (meteora_dbc_config_cache_1.MeteoraDBCConfigCache.has(configAddress)) {
            this.stats.cacheHits++;
            // Still notify if callback is set (with cached data)
            if (this.onConfigFetched) {
                const cached = meteora_dbc_config_cache_1.MeteoraDBCConfigCache.get(configAddress);
                // Use setImmediate to not block
                setImmediate(() => this.onConfigFetched?.(configAddress, cached ?? null));
            }
            return false;
        }
        // Skip if already queued
        if (this.queue.has(configAddress)) {
            return false;
        }
        // Check queue size
        if (this.queue.size >= this.maxQueueSize) {
            return false;
        }
        this.queue.add(configAddress);
        this.stats.queued++;
        return true;
    }
    /**
     * Queue multiple config addresses for background fetching (non-blocking)
     *
     * @param configAddresses Array of config account addresses
     * @returns Number of addresses actually queued
     */
    queueFetchMultiple(configAddresses) {
        let queued = 0;
        for (const addr of configAddresses) {
            if (this.queueFetch(addr)) {
                queued++;
            }
        }
        return queued;
    }
    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            pendingInQueue: this.queue.size,
        };
    }
    /**
     * Check if the worker is running
     */
    get running() {
        return this.isRunning;
    }
    /**
     * Get number of pending items in queue
     */
    get pendingCount() {
        return this.queue.size;
    }
    /**
     * Process a batch of queued addresses
     * Called by the interval timer
     */
    async processBatch() {
        // Skip if already processing or queue empty
        if (this.processing || this.queue.size === 0)
            return;
        this.processing = true;
        try {
            // Take a batch from the queue
            const batch = [];
            for (const addr of this.queue) {
                batch.push(addr);
                if (batch.length >= this.batchSize)
                    break;
            }
            // Remove from queue
            for (const addr of batch) {
                this.queue.delete(addr);
            }
            if (batch.length === 0)
                return;
            // Fetch from RPC
            const results = await this.fetchBatch(batch);
            // Notify callbacks
            if (this.onConfigFetched) {
                for (const addr of batch) {
                    const data = results.get(addr) ?? null;
                    this.onConfigFetched(addr, data);
                }
            }
            this.stats.fetched += results.size;
        }
        catch (error) {
            this.stats.errors++;
            if (this.onError) {
                this.onError(error, []);
            }
        }
        finally {
            this.processing = false;
        }
    }
    /**
     * Fetch a batch of configs from RPC
     */
    async fetchBatch(addresses) {
        try {
            return await meteora_dbc_config_cache_1.MeteoraDBCConfigCache.fetchMultipleFromRpc(this.connection, addresses);
        }
        catch (error) {
            // On error, try fetching individually
            const results = new Map();
            for (const addr of addresses) {
                try {
                    const data = await meteora_dbc_config_cache_1.MeteoraDBCConfigCache.fetchFromRpc(this.connection, addr);
                    if (data) {
                        results.set(addr, data);
                    }
                }
                catch {
                    // Skip individual errors
                }
            }
            return results;
        }
    }
    /**
     * Force process all pending items immediately
     * Returns a promise that resolves when all items are processed
     * (Use this for graceful shutdown)
     */
    async flush() {
        while (this.queue.size > 0) {
            await this.processBatch();
        }
    }
}
exports.BackgroundConfigFetcher = BackgroundConfigFetcher;
/**
 * Helper function to enrich a MemeEvent with config data from cache
 * Call this after the background fetcher has had time to populate the cache
 *
 * @param event The MemeEvent to enrich
 * @returns The enriched event (mutates original)
 */
function enrichMemeEventWithConfig(event) {
    // Only enrich Meteora DBC CREATE events
    if (event.type !== 'CREATE' || event.protocol !== 'MeteoraDBC') {
        return false;
    }
    // Skip if already has data
    if (event.totalQuoteFundRaising && event.virtualSolReserves) {
        return false;
    }
    const configAddress = event.platformConfig;
    if (!configAddress)
        return false;
    const configData = meteora_dbc_config_cache_1.MeteoraDBCConfigCache.get(configAddress);
    if (!configData)
        return false;
    // Calculate virtualSolReserves from sqrtStartPrice
    if (!event.virtualSolReserves || event.virtualSolReserves === 0) {
        const Q64 = 18446744073709551616n;
        const VIRTUAL_TOKEN_SUPPLY = BigInt(event.tokenTotalSupply || 1000000000000000);
        const priceNumerator = configData.sqrtStartPrice * configData.sqrtStartPrice;
        const priceDenominator = Q64 * Q64;
        event.virtualSolReserves = Number((VIRTUAL_TOKEN_SUPPLY * priceNumerator) / priceDenominator);
    }
    // Set totalQuoteFundRaising
    if (!event.totalQuoteFundRaising) {
        event.totalQuoteFundRaising = Number(configData.migrationQuoteThreshold);
    }
    return true;
}
//# sourceMappingURL=meteora-dbc-config-fetcher.js.map