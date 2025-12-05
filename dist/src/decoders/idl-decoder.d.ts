/**
 * IdlDecoder - Base class for IDL-based instruction/event decoding
 *
 * Uses @coral-xyz/anchor BorshCoder for type-safe decoding of Solana program
 * instructions and events based on their IDL (Interface Definition Language).
 */
import { BorshCoder, Idl } from '@coral-xyz/anchor';
import { Buffer } from 'buffer';
export interface DecodedInstruction {
    name: string;
    data: Record<string, unknown>;
}
export interface DecodedEvent {
    name: string;
    data: Record<string, unknown>;
}
export declare class IdlDecoder {
    protected readonly coder: BorshCoder;
    protected readonly idl: Idl;
    private instructionDiscriminators;
    private eventDiscriminators;
    constructor(idl: Idl);
    /**
     * Build maps of instruction/event names to their discriminators
     */
    private buildDiscriminatorMaps;
    /**
     * Get the discriminator for an instruction by name
     */
    getInstructionDiscriminator(name: string): Buffer | undefined;
    /**
     * Get the discriminator for an event by name
     */
    getEventDiscriminator(name: string): Buffer | undefined;
    /**
     * Get all instruction discriminators
     */
    getAllInstructionDiscriminators(): Map<string, Buffer>;
    /**
     * Get all event discriminators
     */
    getAllEventDiscriminators(): Map<string, Buffer>;
    /**
     * Decode an instruction from raw data
     * @param data - Raw instruction data (includes discriminator)
     * @returns Decoded instruction or null if not recognized
     */
    decodeInstruction(data: Buffer | Uint8Array): DecodedInstruction | null;
    /**
     * Decode an event from raw data
     * @param data - Raw event data (includes discriminator)
     * @returns Decoded event or null if not recognized
     */
    decodeEvent(data: Buffer | Uint8Array): DecodedEvent | null;
    /**
     * Find instruction by matching discriminator prefix
     * @param data - Raw data to check
     * @returns Instruction name if discriminator matches, null otherwise
     */
    findInstructionByDiscriminator(data: Buffer | Uint8Array): string | null;
    /**
     * Find event by matching discriminator prefix
     * Events have 8-byte discriminators in Anchor
     * @param data - Raw data to check
     * @returns Event name if discriminator matches, null otherwise
     */
    findEventByDiscriminator(data: Buffer | Uint8Array): string | null;
    /**
     * Check if data matches a specific instruction discriminator
     */
    isInstruction(data: Buffer | Uint8Array, instructionName: string): boolean;
    /**
     * Check if data matches a specific event discriminator
     */
    isEvent(data: Buffer | Uint8Array, eventName: string): boolean;
    /**
     * Get the IDL metadata
     */
    getMetadata(): {
        name: string;
        version: string;
        address?: string;
    };
    /**
     * List all instruction names defined in the IDL
     */
    listInstructions(): string[];
    /**
     * List all event names defined in the IDL
     */
    listEvents(): string[];
}
