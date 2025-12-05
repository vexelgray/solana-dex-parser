import { PublicKey } from '@solana/web3.js';
export declare const DEX_PROGRAMS: {
    JUPITER: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_V2: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_V4: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_DCA: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_DCA_KEEPER1: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_DCA_KEEPER2: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_DCA_KEEPER3: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_LIMIT_ORDER: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_LIMIT_ORDER_V2: {
        id: string;
        name: string;
        tags: string[];
    };
    JUPITER_VA: {
        id: string;
        name: string;
        tags: string[];
    };
    OKX_DEX: {
        id: string;
        name: string;
        tags: string[];
    };
    OKX_ROUTER: {
        id: string;
        name: string;
        tags: string[];
    };
    RAYDIUM_ROUTE: {
        id: string;
        name: string;
        tags: string[];
    };
    SANCTUM: {
        id: string;
        name: string;
        tags: string[];
    };
    PHOTON: {
        id: string;
        name: string;
        tags: string[];
    };
    RAYDIUM_V4: {
        id: string;
        name: string;
        tags: string[];
    };
    RAYDIUM_AMM: {
        id: string;
        name: string;
        tags: string[];
    };
    RAYDIUM_CPMM: {
        id: string;
        name: string;
        tags: string[];
    };
    RAYDIUM_CL: {
        id: string;
        name: string;
        tags: string[];
    };
    RAYDIUM_LCP: {
        id: string;
        name: string;
        tags: string[];
    };
    ORCA: {
        id: string;
        name: string;
        tags: string[];
    };
    ORCA_V2: {
        id: string;
        name: string;
        tags: string[];
    };
    ORCA_V1: {
        id: string;
        name: string;
        tags: string[];
    };
    PHOENIX: {
        id: string;
        name: string;
        tags: string[];
    };
    OPENBOOK: {
        id: string;
        name: string;
        tags: string[];
    };
    METEORA: {
        id: string;
        name: string;
        tags: string[];
    };
    METEORA_DAMM: {
        id: string;
        name: string;
        tags: string[];
    };
    METEORA_DAMM_V2: {
        id: string;
        name: string;
        tags: string[];
    };
    METEORA_DBC: {
        id: string;
        name: string;
        tags: string[];
    };
    SERUM_V3: {
        id: string;
        name: string;
        tags: string[];
    };
    METEORA_VAULT: {
        id: string;
        name: string;
        tags: string[];
    };
    STABBEL_VAULT: {
        id: string;
        name: string;
        tags: string[];
    };
    BANANA_GUN: {
        id: string;
        name: string;
        tags: string[];
    };
    MINTECH: {
        id: string;
        name: string;
        tags: string[];
    };
    BLOOM: {
        id: string;
        name: string;
        tags: string[];
    };
    MAESTRO: {
        id: string;
        name: string;
        tags: string[];
    };
    NOVA: {
        id: string;
        name: string;
        tags: string[];
    };
    APEPRO: {
        id: string;
        name: string;
        tags: string[];
    };
    AXIOM: {
        id: string;
        name: string;
        tags: string[];
    };
    PADRE: {
        id: string;
        name: string;
        tags: string[];
    };
    ALDRIN: {
        id: string;
        name: string;
        tags: string[];
    };
    ALDRIN_V2: {
        id: string;
        name: string;
        tags: string[];
    };
    CREMA: {
        id: string;
        name: string;
        tags: string[];
    };
    GOOSEFX: {
        id: string;
        name: string;
        tags: string[];
    };
    LIFINITY: {
        id: string;
        name: string;
        tags: string[];
    };
    LIFINITY_V2: {
        id: string;
        name: string;
        tags: string[];
    };
    MERCURIAL: {
        id: string;
        name: string;
        tags: string[];
    };
    MOONIT: {
        id: string;
        name: string;
        tags: string[];
    };
    ONEDEX: {
        id: string;
        name: string;
        tags: string[];
    };
    PUMP_FUN: {
        id: string;
        name: string;
        tags: string[];
    };
    PUMP_SWAP: {
        id: string;
        name: string;
        tags: string[];
    };
    SABER: {
        id: string;
        name: string;
        tags: string[];
    };
    SAROS: {
        id: string;
        name: string;
        tags: string[];
    };
    SOLFI: {
        id: string;
        name: string;
        tags: string[];
    };
    STABBEL: {
        id: string;
        name: string;
        tags: string[];
    };
    STABBEL_WEIGHT: {
        id: string;
        name: string;
        tags: string[];
    };
    BOOP_FUN: {
        id: string;
        name: string;
        tags: string[];
    };
    ZERO_FI: {
        id: string;
        name: string;
        tags: string[];
    };
    SUGAR: {
        id: string;
        name: string;
        tags: string[];
    };
    HEAVEN: {
        id: string;
        name: string;
        tags: string[];
    };
    HEAVEN_VAULT: {
        id: string;
        name: string;
        tags: string[];
    };
};
export declare const DEX_PROGRAM_IDS: string[];
export declare const SYSTEM_PROGRAMS: string[];
export declare const SKIP_PROGRAM_IDS: string[];
export declare const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
/** Address of the SPL Token 2022 program */
export declare const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export declare const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey;
export declare const PUMPFUN_MIGRATORS: string[];
export declare const METAPLEX_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
export declare const FEE_ACCOUNTS: string[];
/**
 * Launchpads with feeClaimer as SIGNER - check transaction signers
 */
export declare const METEORA_DBC_LAUNCHPAD_SIGNERS: Record<string, string>;
/**
 * Launchpads that invoke Meteora DBC via CPI - check caller programs
 */
export declare const METEORA_DBC_LAUNCHPAD_PROGRAMS: Record<string, string>;
/** @deprecated Use METEORA_DBC_LAUNCHPAD_SIGNERS and METEORA_DBC_LAUNCHPAD_PROGRAMS */
export declare const METEORA_DBC_LAUNCHPADS: Record<string, string>;
/**
 * Raydium Launchpad platform configs that identify specific launchpads.
 * The config address in CREATE events identifies which launchpad was used.
 */
export declare const RAYDIUM_LCP_LAUNCHPAD_CONFIGS: Record<string, string>;
