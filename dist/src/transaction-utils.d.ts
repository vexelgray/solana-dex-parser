import { InstructionClassifier } from './instruction-classifier';
import { TransactionAdapter } from './transaction-adapter';
import { ClassifiedInstruction, DexInfo, MemeEvent, PoolEvent, TokenInfo, TradeInfo, TransferData, TransferInfo } from './types';
export declare class TransactionUtils {
    private adapter;
    constructor(adapter: TransactionAdapter);
    /**
     * Get DEX information from transaction
     */
    getDexInfo(classifier: InstructionClassifier): DexInfo;
    /**
     * Get transfer actions from transaction
     */
    getTransferActions(extraTypes?: string[]): Record<string, TransferData[]>;
    processTransferInstructions(outerIndex: number, extraTypes?: string[]): TransferData[];
    /**
     * Parse instruction actions (both parsed and compiled)
     * actions: transfer/transferCheced/mintTo/burn
     */
    parseInstructionAction(instruction: any, idx: string, extraTypes?: string[]): TransferData | null;
    /**
     * Parse parsed instruction
     */
    parseParsedInstructionAction(instruction: any, idx: string, extraTypes?: string[]): TransferData | null;
    /**
     * Parse compiled instruction
     */
    parseCompiledInstructionAction(instruction: any, idx: string, extraTypes?: string[]): TransferData | null;
    /**
     * Get mint from instruction
     */
    getMintFromInstruction(ix: any, info: any): string | undefined;
    /**
     * Get token amount from instruction info
     */
    getTokenAmount(info: any, decimals: number): any;
    /**
     * Check if program should be ignored for grouping
     */
    isIgnoredProgram(programId: string): boolean;
    /**
     * Get transfer info from transfer data
     */
    getTransferInfo(transferData: TransferData, timestamp: number, signature: string): TransferInfo | null;
    /**
     * Get transfer info list from transfer data
     */
    getTransferInfoList(transferDataList: TransferData[]): TransferInfo[];
    /**
     * Process swap data from transfers
     */
    processSwapData(transfers: TransferData[], dexInfo: DexInfo, skipNative?: boolean): TradeInfo | null;
    /**
     * Get signer for swap transaction
     */
    getSwapSigner(): string;
    /**
     * Extract unique tokens from transfers
     */
    private extractUniqueTokens;
    /**
     * Calculate token amounts for swap
     */
    private calculateTokenAmounts;
    /**
     * Sum token amounts from transfers
     */
    private sumTokenAmounts;
    /**
     * Get token info from transfer data
     */
    getTransferTokenInfo(transfer: TransferData): TokenInfo | null;
    /**
     * Sort and get LP tokens
     * make sure token0 is SPL Token, token1 is SOL/USDC/USDT
     * SOL,USDT > buy
     * SOL,DDD > buy
     * USDC,USDT/DDD > buy
     * USDT,USDC
     * DDD,USDC > sell
     * USDC,SOL > sell
     * USDT,SOL > sell
     * @param transfers
     * @returns
     */
    getLPTransfers: (transfers: TransferData[]) => TransferData[];
    attachTokenTransferInfo: (trade: TradeInfo, transferActions: Record<string, TransferData[]>) => TradeInfo;
    attachUserBalanceToLPs: (liquidities: PoolEvent[]) => PoolEvent[];
    /**
     * Process transfer data for meme token events
     * Handles the common transfer processing logic
     * @param cInst Classified instruction
     * @param event Meme event to update
     * @param baseMint Base token mint address
     * @param skipNative Whether to skip native SOL transfers
     * @param transferStartIdx Starting index for transfer processing
     * @returns Updated meme event or null if processing fails
     */
    processMemeTransferData(cInst: ClassifiedInstruction, event: MemeEvent, baseMint: string, skipNative: boolean, transferStartIdx: number, transferActions: Record<string, TransferData[]>): MemeEvent;
    /**
     * Get DEX program name by program ID
     * @param programId Program ID
     * @returns Program name or 'Unknown'
     */
    private getDexProgramName;
    /**
     * Update meme event token information from trade data
     * @param event Meme event to update
     * @param trade Trade information source
     */
    updateMemeTokenInfo(event: MemeEvent, trade: TradeInfo): void;
    /**
     * Filter transfers for a specific instruction
     * @param transferActions Map of transfer actions
     * @param programId Program ID
     * @param outerIndex Outer instruction index
     * @param innerIndex Inner instruction index (optional)
     * @param filterTypes Types to filter by
     * @returns Filtered transfer data array
     */
    filterTransfersForInstruction(transferActions: Record<string, TransferData[]>, programId: string, outerIndex: number, innerIndex?: number, filterTypes?: string[]): TransferData[];
    /**
     * Get transfers for a specific instruction with default types
     * Default types: transfer, transferChecked
     * @param transferActions Map of transfer actions
     * @param programId Program ID
     * @param outerIndex Outer instruction index
     * @param innerIndex Inner instruction index (optional)
     * @param extraTypes Additional types to include
     * @returns Transfer data array
     */
    getTransfersForInstruction(transferActions: Record<string, TransferData[]>, programId: string, outerIndex: number, innerIndex?: number, extraTypes?: string[]): TransferData[];
}
