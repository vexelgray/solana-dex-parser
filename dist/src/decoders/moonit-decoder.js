"use strict";
/**
 * MoonitDecoder - Standalone decoder for Moonit (Moonshot) program events
 *
 * Provides type-safe decoding of Moonit events.
 * Note: Uses standalone implementation because the Moonit IDL is in legacy format
 * that's incompatible with modern BorshCoder.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moonitDecoder = exports.MoonitDecoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const sha256_1 = require("@noble/hashes/sha256");
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
/**
 * Compute Anchor event discriminator from event name
 * Format: sha256("event:<EventName>")[0..8]
 */
function computeEventDiscriminator(eventName) {
    const hash = (0, sha256_1.sha256)(`event:${eventName}`);
    return buffer_1.Buffer.from(hash.slice(0, 8));
}
// Pre-computed discriminators for Moonit events
const MOONIT_EVENT_DISCRIMINATORS = new Map([
    ['TradeEvent', computeEventDiscriminator('TradeEvent')],
    ['MigrationEvent', computeEventDiscriminator('MigrationEvent')],
]);
class MoonitDecoder {
    /**
     * Check if data is a Moonit event (has Anchor event prefix)
     */
    isMoonitEvent(data) {
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
        if (!this.isMoonitEvent(data))
            return null;
        const eventDisc = this.getEventDiscriminatorFromData(data);
        if (!eventDisc)
            return null;
        for (const [name, disc] of MOONIT_EVENT_DISCRIMINATORS) {
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
            const eventData = buffer.subarray(16);
            return this.parseTradeEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode MigrationEvent from raw data
     */
    decodeMigrationEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'MigrationEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseMigrationEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse TradeEvent data (without prefix)
     * Fields: amount, collateralAmount, dexFee, helioFee, allocation, curve, costToken, sender, type, label
     */
    parseTradeEventData(data) {
        let offset = 0;
        const amount = data.readBigUInt64LE(offset);
        offset += 8;
        const collateralAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const dexFee = data.readBigUInt64LE(offset);
        offset += 8;
        const helioFee = data.readBigUInt64LE(offset);
        offset += 8;
        const allocation = data.readBigUInt64LE(offset);
        offset += 8;
        const curve = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const costToken = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const sender = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        // TradeType enum (1 byte: 0 = BUY, 1 = SELL)
        const tradeType = data.readUInt8(offset);
        offset += 1;
        // Read string field (borsh format: 4-byte length prefix + utf8)
        const labelLen = data.readUInt32LE(offset);
        offset += 4;
        const label = data.subarray(offset, offset + labelLen).toString('utf8');
        return {
            amount,
            collateralAmount,
            dexFee,
            helioFee,
            allocation,
            curve,
            costToken,
            sender,
            tradeType,
            label,
        };
    }
    /**
     * Parse MigrationEvent data (without prefix)
     * Fields: tokensMigrated, tokensBurned, collateralMigrated, fee, label
     */
    parseMigrationEventData(data) {
        let offset = 0;
        const tokensMigrated = data.readBigUInt64LE(offset);
        offset += 8;
        const tokensBurned = data.readBigUInt64LE(offset);
        offset += 8;
        const collateralMigrated = data.readBigUInt64LE(offset);
        offset += 8;
        const fee = data.readBigUInt64LE(offset);
        offset += 8;
        // Read string field (borsh format: 4-byte length prefix + utf8)
        const labelLen = data.readUInt32LE(offset);
        offset += 4;
        const label = data.subarray(offset, offset + labelLen).toString('utf8');
        return {
            tokensMigrated,
            tokensBurned,
            collateralMigrated,
            fee,
            label,
        };
    }
    /**
     * Decode any Moonit event based on discriminator
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
            case 'MigrationEvent': {
                const decoded = this.decodeMigrationEvent(data);
                return decoded ? { type: 'MIGRATE', data: decoded } : null;
            }
            default:
                return null;
        }
    }
}
exports.MoonitDecoder = MoonitDecoder;
// Export singleton instance for convenience
exports.moonitDecoder = new MoonitDecoder();
//# sourceMappingURL=moonit-decoder.js.map