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

export class IdlDecoder {
  protected readonly coder: BorshCoder;
  protected readonly idl: Idl;
  private instructionDiscriminators: Map<string, Buffer>;
  private eventDiscriminators: Map<string, Buffer>;

  constructor(idl: Idl) {
    this.idl = idl;
    this.coder = new BorshCoder(idl);
    this.instructionDiscriminators = new Map();
    this.eventDiscriminators = new Map();
    this.buildDiscriminatorMaps();
  }

  /**
   * Build maps of instruction/event names to their discriminators
   */
  private buildDiscriminatorMaps(): void {
    // Build instruction discriminators from IDL
    if (this.idl.instructions) {
      for (const ix of this.idl.instructions) {
        if (ix.discriminator) {
          const discriminator = Buffer.from(ix.discriminator);
          this.instructionDiscriminators.set(ix.name, discriminator);
        }
      }
    }

    // Build event discriminators from IDL
    if (this.idl.events) {
      for (const evt of this.idl.events) {
        if (evt.discriminator) {
          const discriminator = Buffer.from(evt.discriminator);
          this.eventDiscriminators.set(evt.name, discriminator);
        }
      }
    }
  }

  /**
   * Get the discriminator for an instruction by name
   */
  getInstructionDiscriminator(name: string): Buffer | undefined {
    return this.instructionDiscriminators.get(name);
  }

  /**
   * Get the discriminator for an event by name
   */
  getEventDiscriminator(name: string): Buffer | undefined {
    return this.eventDiscriminators.get(name);
  }

  /**
   * Get all instruction discriminators
   */
  getAllInstructionDiscriminators(): Map<string, Buffer> {
    return new Map(this.instructionDiscriminators);
  }

  /**
   * Get all event discriminators
   */
  getAllEventDiscriminators(): Map<string, Buffer> {
    return new Map(this.eventDiscriminators);
  }

  /**
   * Decode an instruction from raw data
   * @param data - Raw instruction data (includes discriminator)
   * @returns Decoded instruction or null if not recognized
   */
  decodeInstruction(data: Buffer | Uint8Array): DecodedInstruction | null {
    try {
      const buffer = Buffer.from(data);
      const decoded = this.coder.instruction.decode(buffer);
      if (!decoded) return null;

      return {
        name: decoded.name,
        data: decoded.data as Record<string, unknown>,
      };
    } catch {
      return null;
    }
  }

  /**
   * Decode an event from raw data
   * @param data - Raw event data (includes discriminator)
   * @returns Decoded event or null if not recognized
   */
  decodeEvent(data: Buffer | Uint8Array): DecodedEvent | null {
    try {
      const buffer = Buffer.from(data);
      const decoded = this.coder.events.decode(buffer.toString('base64'));
      if (!decoded) return null;

      return {
        name: decoded.name,
        data: decoded.data as Record<string, unknown>,
      };
    } catch {
      return null;
    }
  }

  /**
   * Find instruction by matching discriminator prefix
   * @param data - Raw data to check
   * @returns Instruction name if discriminator matches, null otherwise
   */
  findInstructionByDiscriminator(data: Buffer | Uint8Array): string | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 8) return null;

    const discriminator = buffer.subarray(0, 8);
    for (const [name, disc] of this.instructionDiscriminators) {
      if (discriminator.equals(disc)) {
        return name;
      }
    }
    return null;
  }

  /**
   * Find event by matching discriminator prefix
   * Events have 8-byte discriminators in Anchor
   * @param data - Raw data to check
   * @returns Event name if discriminator matches, null otherwise
   */
  findEventByDiscriminator(data: Buffer | Uint8Array): string | null {
    const buffer = Buffer.from(data);
    if (buffer.length < 8) return null;

    const discriminator = buffer.subarray(0, 8);
    for (const [name, disc] of this.eventDiscriminators) {
      if (disc.length <= buffer.length && discriminator.subarray(0, disc.length).equals(disc)) {
        return name;
      }
    }
    return null;
  }

  /**
   * Check if data matches a specific instruction discriminator
   */
  isInstruction(data: Buffer | Uint8Array, instructionName: string): boolean {
    const discriminator = this.getInstructionDiscriminator(instructionName);
    if (!discriminator) return false;

    const buffer = Buffer.from(data);
    if (buffer.length < discriminator.length) return false;

    return buffer.subarray(0, discriminator.length).equals(discriminator);
  }

  /**
   * Check if data matches a specific event discriminator
   */
  isEvent(data: Buffer | Uint8Array, eventName: string): boolean {
    const discriminator = this.getEventDiscriminator(eventName);
    if (!discriminator) return false;

    const buffer = Buffer.from(data);
    if (buffer.length < discriminator.length) return false;

    return buffer.subarray(0, discriminator.length).equals(discriminator);
  }

  /**
   * Get the IDL metadata
   */
  getMetadata(): { name: string; version: string; address?: string } {
    return {
      name: this.idl.metadata?.name ?? 'unknown',
      version: this.idl.metadata?.version ?? '0.0.0',
      address: this.idl.address,
    };
  }

  /**
   * List all instruction names defined in the IDL
   */
  listInstructions(): string[] {
    return this.idl.instructions?.map((ix) => ix.name) ?? [];
  }

  /**
   * List all event names defined in the IDL
   */
  listEvents(): string[] {
    return this.idl.events?.map((evt) => evt.name) ?? [];
  }
}
