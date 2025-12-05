import { Connection } from '@solana/web3.js';
import { MeteoraDBCConfigCache, MeteoraDBCConfigData } from './meteora-dbc-config-cache';

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
export class BackgroundConfigFetcher {
  private connection: Connection;
  private batchSize: number;
  private batchIntervalMs: number;
  private maxQueueSize: number;
  private onConfigFetched?: ConfigFetchedCallback;
  private onError?: (error: Error, configAddresses: string[]) => void;

  private queue: Set<string> = new Set();
  private processing: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  // Stats
  private stats = {
    queued: 0,
    fetched: 0,
    errors: 0,
    cacheHits: 0,
  };

  constructor(options: BackgroundConfigFetcherOptions) {
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
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.processBatch(), this.batchIntervalMs);
  }

  /**
   * Stop the background worker
   */
  stop(): void {
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
  queueFetch(configAddress: string): boolean {
    // Skip if already in cache
    if (MeteoraDBCConfigCache.has(configAddress)) {
      this.stats.cacheHits++;
      // Still notify if callback is set (with cached data)
      if (this.onConfigFetched) {
        const cached = MeteoraDBCConfigCache.get(configAddress);
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
  queueFetchMultiple(configAddresses: string[]): number {
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
  getStats(): { queued: number; fetched: number; errors: number; cacheHits: number; pendingInQueue: number } {
    return {
      ...this.stats,
      pendingInQueue: this.queue.size,
    };
  }

  /**
   * Check if the worker is running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get number of pending items in queue
   */
  get pendingCount(): number {
    return this.queue.size;
  }

  /**
   * Process a batch of queued addresses
   * Called by the interval timer
   */
  private async processBatch(): Promise<void> {
    // Skip if already processing or queue empty
    if (this.processing || this.queue.size === 0) return;

    this.processing = true;

    try {
      // Take a batch from the queue
      const batch: string[] = [];
      for (const addr of this.queue) {
        batch.push(addr);
        if (batch.length >= this.batchSize) break;
      }

      // Remove from queue
      for (const addr of batch) {
        this.queue.delete(addr);
      }

      if (batch.length === 0) return;

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
    } catch (error) {
      this.stats.errors++;
      if (this.onError) {
        this.onError(error as Error, []);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Fetch a batch of configs from RPC
   */
  private async fetchBatch(addresses: string[]): Promise<Map<string, MeteoraDBCConfigData>> {
    try {
      return await MeteoraDBCConfigCache.fetchMultipleFromRpc(this.connection, addresses);
    } catch (error) {
      // On error, try fetching individually
      const results = new Map<string, MeteoraDBCConfigData>();
      for (const addr of addresses) {
        try {
          const data = await MeteoraDBCConfigCache.fetchFromRpc(this.connection, addr);
          if (data) {
            results.set(addr, data);
          }
        } catch {
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
  async flush(): Promise<void> {
    while (this.queue.size > 0) {
      await this.processBatch();
    }
  }
}

/**
 * Helper function to enrich a MemeEvent with config data from cache
 * Call this after the background fetcher has had time to populate the cache
 *
 * @param event The MemeEvent to enrich
 * @returns The enriched event (mutates original)
 */
export function enrichMemeEventWithConfig(event: {
  type?: string;
  protocol?: string;
  platformConfig?: string;
  totalQuoteFundRaising?: number;
  virtualSolReserves?: number;
  tokenTotalSupply?: number;
}): boolean {
  // Only enrich Meteora DBC CREATE events
  if (event.type !== 'CREATE' || event.protocol !== 'MeteoraDBC') {
    return false;
  }

  // Skip if already has data
  if (event.totalQuoteFundRaising && event.virtualSolReserves) {
    return false;
  }

  const configAddress = event.platformConfig;
  if (!configAddress) return false;

  const configData = MeteoraDBCConfigCache.get(configAddress);
  if (!configData) return false;

  // Calculate virtualSolReserves from sqrtStartPrice
  if (!event.virtualSolReserves || event.virtualSolReserves === 0) {
    const Q64 = 18446744073709551616n;
    const VIRTUAL_TOKEN_SUPPLY = BigInt(event.tokenTotalSupply || 1_000_000_000_000_000);
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
