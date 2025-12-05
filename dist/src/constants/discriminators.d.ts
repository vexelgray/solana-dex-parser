export declare const DISCRIMINATORS: {
    readonly JUPITER: {
        readonly ROUTE_EVENT: Uint8Array<ArrayBuffer>;
    };
    readonly JUPITER_DCA: {
        readonly FILLED: Uint8Array<ArrayBuffer>;
        readonly CLOSE_DCA: Uint8Array<ArrayBuffer>;
        readonly OPEN_DCA: Uint8Array<ArrayBuffer>;
        readonly OPEN_DCA_V2: Uint8Array<ArrayBuffer>;
    };
    readonly JUPITER_LIMIT_ORDER: {
        readonly CANCEL_ORDER: Uint8Array<ArrayBuffer>;
        readonly CREATE_ORDER: Uint8Array<ArrayBuffer>;
        readonly TRADE_EVENT: Uint8Array<ArrayBuffer>;
        readonly UNKNOWN: Uint8Array<ArrayBuffer>;
        readonly FLASH_FILL_ORDER: Uint8Array<ArrayBuffer>;
    };
    readonly JUPITER_LIMIT_ORDER_V2: {
        readonly CANCEL_ORDER: Uint8Array<ArrayBuffer>;
        readonly CREATE_ORDER_EVENT: Uint8Array<ArrayBuffer>;
        readonly TRADE_EVENT: Uint8Array<ArrayBuffer>;
        readonly UNKNOWN: Uint8Array<ArrayBuffer>;
        readonly FLASH_FILL_ORDER: Uint8Array<ArrayBuffer>;
    };
    readonly JUPITER_VA: {
        readonly FILL_EVENT: Uint8Array<ArrayBuffer>;
        readonly OPEN_EVENT: Uint8Array<ArrayBuffer>;
        readonly CLOSE_EVENT: Uint8Array<ArrayBuffer>;
        readonly DEPOSIT_EVENT: Uint8Array<ArrayBuffer>;
        readonly WITHDRAW_EVENT: Uint8Array<ArrayBuffer>;
    };
    readonly PUMPFUN: {
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly MIGRATE: Uint8Array<ArrayBuffer>;
        readonly BUY: Uint8Array<ArrayBuffer>;
        readonly SELL: Uint8Array<ArrayBuffer>;
        readonly TRADE_EVENT: Uint8Array<ArrayBuffer>;
        readonly CREATE_EVENT: Uint8Array<ArrayBuffer>;
        readonly COMPLETE_EVENT: Uint8Array<ArrayBuffer>;
        readonly MIGRATE_EVENT: Uint8Array<ArrayBuffer>;
    };
    readonly PUMPSWAP: {
        readonly CREATE_POOL: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly BUY: Uint8Array<ArrayBuffer>;
        readonly SELL: Uint8Array<ArrayBuffer>;
        readonly CREATE_POOL_EVENT: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY_EVENT: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY_EVENT: Uint8Array<ArrayBuffer>;
        readonly BUY_EVENT: Uint8Array<ArrayBuffer>;
        readonly SELL_EVENT: Uint8Array<ArrayBuffer>;
    };
    readonly MOONIT: {
        readonly BUY: Uint8Array<ArrayBuffer>;
        readonly SELL: Uint8Array<ArrayBuffer>;
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly MIGRATE: Uint8Array<ArrayBuffer>;
    };
    readonly RAYDIUM: {
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY: Uint8Array<ArrayBuffer>;
    };
    readonly RAYDIUM_CL: {
        readonly CREATE: {
            readonly createPool: Uint8Array<ArrayBuffer>;
        };
        readonly ADD_LIQUIDITY: {
            readonly openPosition: Uint8Array<ArrayBuffer>;
            readonly openPositionV2: Uint8Array<ArrayBuffer>;
            readonly openPositionWithToken22Nft: Uint8Array<ArrayBuffer>;
            readonly increaseLiquidity: Uint8Array<ArrayBuffer>;
            readonly increaseLiquidityV2: Uint8Array<ArrayBuffer>;
        };
        readonly REMOVE_LIQUIDITY: {
            readonly decreaseLiquidity: Uint8Array<ArrayBuffer>;
            readonly decreaseLiquidityV2: Uint8Array<ArrayBuffer>;
        };
    };
    readonly RAYDIUM_CPMM: {
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY: Uint8Array<ArrayBuffer>;
    };
    readonly RAYDIUM_LCP: {
        readonly CREATE_EVENT: Uint8Array<ArrayBuffer>;
        readonly TRADE_EVENT: Uint8Array<ArrayBuffer>;
        readonly MIGRATE_TO_AMM: Uint8Array<ArrayBuffer>;
        readonly MIGRATE_TO_CPSWAP: Uint8Array<ArrayBuffer>;
        readonly BUY_EXACT_IN: Uint8Array<ArrayBuffer>;
        readonly BUY_EXACT_OUT: Uint8Array<ArrayBuffer>;
        readonly SELL_EXACT_IN: Uint8Array<ArrayBuffer>;
        readonly SELL_EXACT_OUT: Uint8Array<ArrayBuffer>;
    };
    readonly METEORA_DLMM: {
        readonly ADD_LIQUIDITY: {
            readonly addLiquidity: Uint8Array<ArrayBuffer>;
            readonly addLiquidityByStrategy: Uint8Array<ArrayBuffer>;
            readonly addLiquidityByStrategy2: Uint8Array<ArrayBuffer>;
            readonly addLiquidityByStrategyOneSide: Uint8Array<ArrayBuffer>;
            readonly addLiquidityOneSide: Uint8Array<ArrayBuffer>;
            readonly addLiquidityOneSidePrecise: Uint8Array<ArrayBuffer>;
            readonly addLiquidityByWeight: Uint8Array<ArrayBuffer>;
        };
        readonly REMOVE_LIQUIDITY: {
            readonly removeLiquidity: Uint8Array<ArrayBuffer>;
            readonly removeLiquidityByRange: Uint8Array<ArrayBuffer>;
            readonly removeLiquidityByRange2: Uint8Array<ArrayBuffer>;
            readonly removeAllLiquidity: Uint8Array<ArrayBuffer>;
            readonly claimFee: Uint8Array<ArrayBuffer>;
            readonly claimFeeV2: Uint8Array<ArrayBuffer>;
        };
        readonly LIQUIDITY_EVENT: {
            readonly compositionFeeEvent: Uint8Array<ArrayBuffer>;
            readonly addLiquidityEvent: Uint8Array<ArrayBuffer>;
            readonly removeLiquidityEvent: Uint8Array<ArrayBuffer>;
        };
    };
    readonly METEORA_DAMM: {
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly ADD_IMBALANCE_LIQUIDITY: Uint8Array<ArrayBuffer>;
    };
    readonly METEORA_DAMM_V2: {
        readonly INITIALIZE_POOL: Uint8Array<ArrayBuffer>;
        readonly INITIALIZE_CUSTOM_POOL: Uint8Array<ArrayBuffer>;
        readonly INITIALIZE_POOL_WITH_DYNAMIC_CONFIG: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly CLAIM_POSITION_FEE: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly REMOVE_ALL_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly CREATE_POSITION_EVENT: Uint8Array<ArrayBuffer>;
    };
    readonly METEORA_DBC: {
        readonly SWAP: Uint8Array<ArrayBuffer>;
        readonly SWAP_V2: Uint8Array<ArrayBuffer>;
        readonly INITIALIZE_VIRTUAL_POOL_WITH_SPL_TOKEN: Uint8Array<ArrayBuffer>;
        readonly INITIALIZE_VIRTUAL_POOL_WITH_TOKEN2022: Uint8Array<ArrayBuffer>;
        readonly METEORA_DBC_MIGRATE_DAMM: Uint8Array<ArrayBuffer>;
        readonly METEORA_DBC_MIGRATE_DAMM_V2: Uint8Array<ArrayBuffer>;
        readonly EVT_SWAP: Uint8Array<ArrayBuffer>;
        readonly EVT_SWAP2: Uint8Array<ArrayBuffer>;
    };
    readonly ORCA: {
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly CREATE2: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly ADD_LIQUIDITY2: Uint8Array<ArrayBuffer>;
        readonly REMOVE_LIQUIDITY: Uint8Array<ArrayBuffer>;
        readonly OTHER1: Uint8Array<ArrayBuffer>;
        readonly OTHER2: Uint8Array<ArrayBuffer>;
    };
    readonly BOOPFUN: {
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly DEPLOY: Uint8Array<ArrayBuffer>;
        readonly COMPLETE: Uint8Array<ArrayBuffer>;
        readonly BUY: Uint8Array<ArrayBuffer>;
        readonly SELL: Uint8Array<ArrayBuffer>;
    };
    readonly HEAVEN: {
        readonly BUY: Uint8Array<ArrayBuffer>;
        readonly SELL: Uint8Array<ArrayBuffer>;
        readonly CREATE_POOL: Uint8Array<ArrayBuffer>;
    };
    readonly METAPLEX: {
        readonly CREATE_MINT: Uint8Array<ArrayBuffer>;
    };
    readonly SUGAR: {
        readonly BUY_EXACT_IN: Uint8Array<ArrayBuffer>;
        readonly BUY_EXACT_OUT: Uint8Array<ArrayBuffer>;
        readonly BUY_MAX_OUT: Uint8Array<ArrayBuffer>;
        readonly SELL_EXACT_IN: Uint8Array<ArrayBuffer>;
        readonly SELL_EXACT_OUT: Uint8Array<ArrayBuffer>;
        readonly CREATE: Uint8Array<ArrayBuffer>;
        readonly INITIALIZE: Uint8Array<ArrayBuffer>;
        readonly MIGRATE_TO_RADIUM: Uint8Array<ArrayBuffer>;
        readonly TRADE_EVENT: Uint8Array<ArrayBuffer>;
        readonly CREATE_EVENT: Uint8Array<ArrayBuffer>;
        readonly COMPLETE_EVENT: Uint8Array<ArrayBuffer>;
        readonly MIGRATE_EVENT: Uint8Array<ArrayBuffer>;
    };
};
