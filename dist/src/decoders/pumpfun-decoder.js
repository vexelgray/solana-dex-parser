"use strict";
/**
 * PumpfunDecoder - IDL-based decoder for Pumpfun program events
 *
 * Provides type-safe decoding of Pumpfun instructions and events
 * using the official IDL from bitquery/solana-idl-lib.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pumpfunDecoder = exports.PumpfunDecoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const pumpfun_json_1 = __importDefault(require("../idls/pumpfun.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
class PumpfunDecoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(pumpfun_json_1.default);
    }
    /**
     * Check if data is a Pumpfun event (has Anchor event prefix)
     */
    isPumpfunEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return false;
        return buffer.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX);
    }
    /**
     * Get the event discriminator from raw data (bytes 8-16 after prefix)
     */
    getEventDiscriminatorFromData(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        return buffer.subarray(8, 16);
    }
    /**
     * Identify event type from raw data
     */
    identifyEvent(data) {
        if (!this.isPumpfunEvent(data))
            return null;
        const eventDisc = this.getEventDiscriminatorFromData(data);
        if (!eventDisc)
            return null;
        const eventDiscriminators = this.getAllEventDiscriminators();
        for (const [name, disc] of eventDiscriminators) {
            if (eventDisc.equals(disc)) {
                return name;
            }
        }
        return null;
    }
    /**
     * Decode TradeEvent from raw data
     * @param data - Raw event data (includes 16-byte prefix: 8 anchor + 8 event discriminator)
     */
    decodeTradeEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'TradeEvent')
            return null;
        try {
            // Skip the 16-byte prefix and decode the rest
            const eventData = buffer.subarray(16);
            return this.parseTradeEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode CreateEvent from raw data
     */
    decodeCreateEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'CreateEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseCreateEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode CompleteEvent from raw data
     */
    decodeCompleteEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'CompleteEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseCompleteEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode MigrateEvent (CompletePumpAmmMigrationEvent) from raw data
     */
    decodeMigrateEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'CompletePumpAmmMigrationEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseMigrateEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse TradeEvent data (without prefix)
     */
    parseTradeEventData(data) {
        let offset = 0;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const solAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const tokenAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const isBuy = data.readUInt8(offset) === 1;
        offset += 1;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const virtualSolReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const virtualTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const result = {
            mint,
            solAmount,
            tokenAmount,
            isBuy,
            user,
            timestamp,
            virtualSolReserves,
            virtualTokenReserves,
        };
        // Optional fields (v2 format)
        if (data.length - offset >= 52) {
            result.realSolReserves = data.readBigUInt64LE(offset);
            offset += 8;
            result.realTokenReserves = data.readBigUInt64LE(offset);
            offset += 8;
            result.feeRecipient = bs58_1.default.encode(data.subarray(offset, offset + 32));
            offset += 32;
            result.feeBasisPoints = data.readUInt16LE(offset);
            offset += 2;
            result.fee = data.readBigUInt64LE(offset);
            offset += 8;
            if (data.length - offset >= 42) {
                result.creator = bs58_1.default.encode(data.subarray(offset, offset + 32));
                offset += 32;
                result.creatorFeeBasisPoints = data.readUInt16LE(offset);
                offset += 2;
                result.creatorFee = data.readBigUInt64LE(offset);
            }
        }
        return result;
    }
    /**
     * Parse CreateEvent data (without prefix)
     */
    parseCreateEventData(data) {
        let offset = 0;
        // Read string fields (borsh format: 4-byte length prefix + utf8)
        const nameLen = data.readUInt32LE(offset);
        offset += 4;
        const name = data.subarray(offset, offset + nameLen).toString('utf8');
        offset += nameLen;
        const symbolLen = data.readUInt32LE(offset);
        offset += 4;
        const symbol = data.subarray(offset, offset + symbolLen).toString('utf8');
        offset += symbolLen;
        const uriLen = data.readUInt32LE(offset);
        offset += 4;
        const uri = data.subarray(offset, offset + uriLen).toString('utf8');
        offset += uriLen;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const bondingCurve = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const result = {
            name,
            symbol,
            uri,
            mint,
            bondingCurve,
            user,
        };
        // Optional fields
        if (data.length - offset >= 40) {
            result.creator = bs58_1.default.encode(data.subarray(offset, offset + 32));
            offset += 32;
            result.timestamp = data.readBigInt64LE(offset);
            offset += 8;
        }
        if (data.length - offset >= 32) {
            result.virtualTokenReserves = data.readBigUInt64LE(offset);
            offset += 8;
            result.virtualSolReserves = data.readBigUInt64LE(offset);
            offset += 8;
            result.realTokenReserves = data.readBigUInt64LE(offset);
            offset += 8;
            result.tokenTotalSupply = data.readBigUInt64LE(offset);
            offset += 8;
        }
        if (data.length - offset >= 33) {
            result.tokenProgram = bs58_1.default.encode(data.subarray(offset, offset + 32));
            offset += 32;
            result.isMayhemMode = data.readUInt8(offset) === 1;
        }
        return result;
    }
    /**
     * Parse CompleteEvent data (without prefix)
     */
    parseCompleteEventData(data) {
        let offset = 0;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const bondingCurve = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const timestamp = data.readBigInt64LE(offset);
        return {
            user,
            mint,
            bondingCurve,
            timestamp,
        };
    }
    /**
     * Parse MigrateEvent data (without prefix)
     */
    parseMigrateEventData(data) {
        let offset = 0;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const mintAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const solAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const poolMigrateFee = data.readBigUInt64LE(offset);
        offset += 8;
        const bondingCurve = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            user,
            mint,
            mintAmount,
            solAmount,
            poolMigrateFee,
            bondingCurve,
            timestamp,
            pool,
        };
    }
    /**
     * Decode any Pumpfun event based on discriminator
     */
    decodeAnyEvent(data) {
        const eventName = this.identifyEvent(data);
        if (!eventName)
            return null;
        switch (eventName) {
            case 'TradeEvent': {
                const decoded = this.decodeTradeEvent(data);
                return decoded ? { type: 'TRADE', data: decoded } : null;
            }
            case 'CreateEvent': {
                const decoded = this.decodeCreateEvent(data);
                return decoded ? { type: 'CREATE', data: decoded } : null;
            }
            case 'CompleteEvent': {
                const decoded = this.decodeCompleteEvent(data);
                return decoded ? { type: 'COMPLETE', data: decoded } : null;
            }
            case 'CompletePumpAmmMigrationEvent': {
                const decoded = this.decodeMigrateEvent(data);
                return decoded ? { type: 'MIGRATE', data: decoded } : null;
            }
            default:
                return null;
        }
    }
}
exports.PumpfunDecoder = PumpfunDecoder;
// Export singleton instance for convenience
exports.pumpfunDecoder = new PumpfunDecoder();
//# sourceMappingURL=pumpfun-decoder.js.map