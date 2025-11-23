import { TokenAmount } from '@solana/web3.js';
import { BalanceChange, ParseConfig, PoolEventType, SolanaTransaction, TokenInfo, TransactionStatus } from './types';
/**
 * Adapter for unified transaction data access
 */
export declare class TransactionAdapter {
    private tx;
    config?: ParseConfig | undefined;
    readonly accountKeys: string[];
    readonly splTokenMap: Map<string, TokenInfo>;
    readonly splDecimalsMap: Map<string, number>;
    constructor(tx: SolanaTransaction, config?: ParseConfig | undefined);
    get txMessage(): any;
    get isMessageV0(): boolean;
    /**
     * Get transaction slot
     */
    get slot(): number;
    get version(): import("@solana/web3.js").TransactionVersion | undefined;
    /**
     * Get transaction block time
     */
    get blockTime(): number;
    /**
     * Get transaction signature
     */
    get signature(): string;
    /**
     * Get all instructions
     */
    get instructions(): any;
    /**
     * Get inner instructions
     */
    get innerInstructions(): import("@solana/web3.js").CompiledInnerInstruction[] | import("@solana/web3.js").ParsedInnerInstruction[] | null | undefined;
    /**
     * Get pre balances
     */
    get preBalances(): number[] | undefined;
    /**
     * Get post balances
     */
    get postBalances(): number[] | undefined;
    /**
     * Get pre token balances
     */
    get preTokenBalances(): import("@solana/web3.js").TokenBalance[] | null | undefined;
    /**
     * Get post token balances
     */
    get postTokenBalances(): import("@solana/web3.js").TokenBalance[] | null | undefined;
    /**
     * Get first signer account
     */
    get signer(): string;
    /**
     * Get Transaction signers
     * @returns Array of signer accounts as strings
     */
    get signers(): string[];
    get fee(): TokenAmount;
    get computeUnits(): number;
    get txStatus(): TransactionStatus;
    extractAccountKeys(): any[];
    get addressTableLookups(): any;
    get addressTableLookupKeys(): string[];
    /**
     * Get unified instruction data
     */
    getInstruction(instruction: any): {
        programId: string;
        accounts: string[];
        data: string | Buffer<ArrayBufferLike>;
        parsed: any;
        program: any;
    };
    getInnerInstruction(outerIndex: number, innterIndex: number): import("@solana/web3.js").ParsedInstruction | import("@solana/web3.js").PartiallyDecodedInstruction | import("@solana/web3.js").CompiledInstruction | undefined;
    getAccountKeys(accounts: any[]): string[];
    getInstructionAccounts(instruction: any): string[];
    /**
     * Check if instruction is Compiled
     */
    isCompiledInstruction(instruction: any): boolean;
    /**
     * Get instruction type
     * returns string name if instruction Parsed, e.g. 'transfer';
     * returns number if instruction is Compiled, e.g. 3
     */
    getInstructionType(instruction: any): string | undefined;
    /**
     * Get account key by index
     */
    getAccountKey(index: number): string;
    getAccountIndex(address: string): number;
    /**
     * Get token account owner
     */
    getTokenAccountOwner(accountKey: string): string | undefined;
    getAccountBalance(accountKeys: string[]): (TokenAmount | undefined)[];
    getAccountPreBalance(accountKeys: string[]): (TokenAmount | undefined)[];
    getTokenAccountBalance(accountKeys: string[]): (TokenAmount | undefined)[];
    getTokenAccountPreBalance(accountKeys: string[]): (TokenAmount | undefined)[];
    private readonly defaultSolInfo;
    /**
     * Check if token is supported
     */
    isSupportedToken(mint: string): boolean;
    /**
     * Get program ID from instruction
     */
    getInstructionProgramId(instruction: any): string;
    getTokenDecimals(mint: string): number;
    /**
     * Create base pool event data
     * @param type - Type of pool event
     * @param tx - The parsed transaction with metadata
     * @param programId - The program ID associated with the event
     * @returns Base pool event object
     */
    getPoolEventBase: (type: PoolEventType, programId: string) => {
        user: string;
        type: PoolEventType;
        programId: string;
        amm: string;
        slot: number;
        timestamp: number;
        signature: string;
    };
    /**
     * Extract token information from transaction
     */
    private extractTokenInfo;
    /**
     * Extract token balances from pre and post states
     */
    private extractTokenBalances;
    /**
     * Extract token info from transfer instructions
     */
    private extractTokenFromInstructions;
    private setTokenInfo;
    /**
     * Extract token info from parsed transfer instruction
     */
    private extractFromParsedTransfer;
    /**
     * Extract token info from compiled transfer instruction
     */
    private extractFromCompiledTransfer;
    /**
     * Get SOL balance changes for all accounts in the transaction
     * @returns Map<string, {pre: TokenAmount; post: TokenAmount; change: TokenAmount}> - A map where:
     *   - key: account address
     *   - value: Object containing:
     *     - pre: TokenAmount for pre-transaction balance, containing:
     *       - amount: balance in raw lamports
     *       - uiAmount: balance in SOL
     *       - decimals: number of decimal places (9 for SOL)
     *     - post: TokenAmount for post-transaction balance
     *     - change: TokenAmount for net balance change
     */
    getAccountSolBalanceChanges(isOwner?: boolean): Map<string, BalanceChange>;
    /**
     * Get token balance changes for all accounts in the transaction
     * @returns Map<string, Map<string, {pre: TokenAmount; post: TokenAmount; change: TokenAmount}>> - A nested map where:
     *   - outer key: account address
     *   - inner key: token mint address
     *   - value: Object containing:
     *     - pre: TokenAmount for pre-transaction balance
     *     - post: TokenAmount for post-transaction balance
     *     - change: TokenAmount for net balance change
     */
    getAccountTokenBalanceChanges(isOwner?: boolean): Map<string, Map<string, BalanceChange>>;
}
