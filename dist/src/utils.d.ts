import { ClassifiedInstruction, DexInfo, TradeInfo, TradeType } from './types';
import { PublicKey } from '@solana/web3.js';
/**
 * Get instruction data
 */
export declare const getInstructionData: (instruction: any) => Buffer;
export declare const decodeInstructionData: (data: any) => Buffer;
/**
 * Get the name of a program by its ID
 * @param programId - The program ID to look up
 * @returns The name of the program or 'Unknown' if not found
 */
export declare const getProgramName: (programId: string) => string;
/**
 * Convert a hex string to Uint8Array
 * @param hex - Hex string to convert
 * @returns Uint8Array representation of the hex string
 */
export declare const hexToUint8Array: (hex: string) => Uint8Array;
export declare const absBigInt: (value: bigint) => bigint;
export declare const getTradeType: (inMint: string, outMint: string) => TradeType;
export declare const getAMMs: (transferActionKeys: string[]) => string[];
export declare const getTranferTokenMint: (token1?: string, token2?: string) => string | undefined;
export declare const getPubkeyString: (value: any) => string;
/**
 * Sort an array of TradeInfo objects by their idx field
 * The idx format is 'main-sub', such as '1-0', '2-1', etc.
 * @param items The TradeInfo array to be sorted
 * @returns The sorted TradeInfo array
 */
export declare const sortByIdx: <T extends {
    idx: string;
}>(items: T[]) => T[];
export declare const getFinalSwap: (trades: TradeInfo[], dexInfo?: DexInfo) => TradeInfo | null;
export declare const findAssociatedTokenAddress: (walletAddress: PublicKey, tokenMintAddress: PublicKey) => {
    standard: PublicKey;
    token2022: PublicKey;
};
export declare const GetAccountTradeType: (userAccount: PublicKey, baseMint: PublicKey, inputUserAcount: PublicKey, outputUserAccount: PublicKey) => TradeType;
export declare const getPrevInstructionByIndex: (instructions: ClassifiedInstruction[], outerIndex: number, innerIndex?: number) => ClassifiedInstruction | null;
