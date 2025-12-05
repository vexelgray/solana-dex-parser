"use strict";
/**
 * IdlDecoder - Base class for IDL-based instruction/event decoding
 *
 * Uses @coral-xyz/anchor BorshCoder for type-safe decoding of Solana program
 * instructions and events based on their IDL (Interface Definition Language).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdlDecoder = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const buffer_1 = require("buffer");
class IdlDecoder {
    constructor(idl) {
        this.idl = idl;
        this.coder = new anchor_1.BorshCoder(idl);
        this.instructionDiscriminators = new Map();
        this.eventDiscriminators = new Map();
        this.buildDiscriminatorMaps();
    }
    /**
     * Build maps of instruction/event names to their discriminators
     */
    buildDiscriminatorMaps() {
        // Build instruction discriminators from IDL
        if (this.idl.instructions) {
            for (const ix of this.idl.instructions) {
                if (ix.discriminator) {
                    const discriminator = buffer_1.Buffer.from(ix.discriminator);
                    this.instructionDiscriminators.set(ix.name, discriminator);
                }
            }
        }
        // Build event discriminators from IDL
        if (this.idl.events) {
            for (const evt of this.idl.events) {
                if (evt.discriminator) {
                    const discriminator = buffer_1.Buffer.from(evt.discriminator);
                    this.eventDiscriminators.set(evt.name, discriminator);
                }
            }
        }
    }
    /**
     * Get the discriminator for an instruction by name
     */
    getInstructionDiscriminator(name) {
        return this.instructionDiscriminators.get(name);
    }
    /**
     * Get the discriminator for an event by name
     */
    getEventDiscriminator(name) {
        return this.eventDiscriminators.get(name);
    }
    /**
     * Get all instruction discriminators
     */
    getAllInstructionDiscriminators() {
        return new Map(this.instructionDiscriminators);
    }
    /**
     * Get all event discriminators
     */
    getAllEventDiscriminators() {
        return new Map(this.eventDiscriminators);
    }
    /**
     * Decode an instruction from raw data
     * @param data - Raw instruction data (includes discriminator)
     * @returns Decoded instruction or null if not recognized
     */
    decodeInstruction(data) {
        try {
            const buffer = buffer_1.Buffer.from(data);
            const decoded = this.coder.instruction.decode(buffer);
            if (!decoded)
                return null;
            return {
                name: decoded.name,
                data: decoded.data,
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Decode an event from raw data
     * @param data - Raw event data (includes discriminator)
     * @returns Decoded event or null if not recognized
     */
    decodeEvent(data) {
        try {
            const buffer = buffer_1.Buffer.from(data);
            const decoded = this.coder.events.decode(buffer.toString('base64'));
            if (!decoded)
                return null;
            return {
                name: decoded.name,
                data: decoded.data,
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Find instruction by matching discriminator prefix
     * @param data - Raw data to check
     * @returns Instruction name if discriminator matches, null otherwise
     */
    findInstructionByDiscriminator(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 8)
            return null;
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
    findEventByDiscriminator(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 8)
            return null;
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
    isInstruction(data, instructionName) {
        const discriminator = this.getInstructionDiscriminator(instructionName);
        if (!discriminator)
            return false;
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < discriminator.length)
            return false;
        return buffer.subarray(0, discriminator.length).equals(discriminator);
    }
    /**
     * Check if data matches a specific event discriminator
     */
    isEvent(data, eventName) {
        const discriminator = this.getEventDiscriminator(eventName);
        if (!discriminator)
            return false;
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < discriminator.length)
            return false;
        return buffer.subarray(0, discriminator.length).equals(discriminator);
    }
    /**
     * Get the IDL metadata
     */
    getMetadata() {
        return {
            name: this.idl.metadata?.name ?? 'unknown',
            version: this.idl.metadata?.version ?? '0.0.0',
            address: this.idl.address,
        };
    }
    /**
     * List all instruction names defined in the IDL
     */
    listInstructions() {
        return this.idl.instructions?.map((ix) => ix.name) ?? [];
    }
    /**
     * List all event names defined in the IDL
     */
    listEvents() {
        return this.idl.events?.map((evt) => evt.name) ?? [];
    }
}
exports.IdlDecoder = IdlDecoder;
//# sourceMappingURL=idl-decoder.js.map