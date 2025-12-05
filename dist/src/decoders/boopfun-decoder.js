"use strict";
/**
 * BoopfunDecoder - IDL-based decoder for Boopfun program events
 *
 * Provides type-safe decoding of Boopfun instructions and events
 * using the official IDL.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.boopfunDecoder = exports.BoopfunDecoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const boopfun_json_1 = __importDefault(require("../idls/boopfun.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
class BoopfunDecoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(boopfun_json_1.default);
    }
    /**
     * Check if data is a Boopfun event (has Anchor event prefix)
     */
    isBoopfunEvent(data) {
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
        if (!this.isBoopfunEvent(data))
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
     * Decode TokenBoughtEvent from raw data
     * @param data - Raw event data (includes 16-byte prefix: 8 anchor + 8 event discriminator)
     */
    decodeTokenBoughtEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'TokenBoughtEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseTokenBoughtEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode TokenSoldEvent from raw data
     */
    decodeTokenSoldEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'TokenSoldEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseTokenSoldEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode TokenCreatedEvent from raw data
     */
    decodeTokenCreatedEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'TokenCreatedEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseTokenCreatedEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode TokenGraduatedEvent from raw data
     */
    decodeTokenGraduatedEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'TokenGraduatedEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseTokenGraduatedEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse TokenBoughtEvent data (without prefix)
     * Fields: mint, amount_in, amount_out, swap_fee, buyer, recipient
     */
    parseTokenBoughtEventData(data) {
        let offset = 0;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const amountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const amountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const swapFee = data.readBigUInt64LE(offset);
        offset += 8;
        const buyer = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const recipient = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            mint,
            amountIn,
            amountOut,
            swapFee,
            buyer,
            recipient,
        };
    }
    /**
     * Parse TokenSoldEvent data (without prefix)
     * Fields: mint, amount_in, amount_out, swap_fee, seller, recipient
     */
    parseTokenSoldEventData(data) {
        let offset = 0;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const amountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const amountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const swapFee = data.readBigUInt64LE(offset);
        offset += 8;
        const seller = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const recipient = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            mint,
            amountIn,
            amountOut,
            swapFee,
            seller,
            recipient,
        };
    }
    /**
     * Parse TokenCreatedEvent data (without prefix)
     * Fields: name, symbol, uri
     */
    parseTokenCreatedEventData(data) {
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
        return {
            name,
            symbol,
            uri,
        };
    }
    /**
     * Parse TokenGraduatedEvent data (without prefix)
     * Fields: mint, sol_for_liquidity, graduation_fee, token_for_distributor
     */
    parseTokenGraduatedEventData(data) {
        let offset = 0;
        const mint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const solForLiquidity = data.readBigUInt64LE(offset);
        offset += 8;
        const graduationFee = data.readBigUInt64LE(offset);
        offset += 8;
        const tokenForDistributor = data.readBigUInt64LE(offset);
        return {
            mint,
            solForLiquidity,
            graduationFee,
            tokenForDistributor,
        };
    }
    /**
     * Decode any Boopfun event based on discriminator
     */
    decodeAnyEvent(data) {
        const eventName = this.identifyEvent(data);
        if (!eventName)
            return null;
        switch (eventName) {
            case 'TokenBoughtEvent': {
                const decoded = this.decodeTokenBoughtEvent(data);
                return decoded ? { type: 'BUY', data: decoded } : null;
            }
            case 'TokenSoldEvent': {
                const decoded = this.decodeTokenSoldEvent(data);
                return decoded ? { type: 'SELL', data: decoded } : null;
            }
            case 'TokenCreatedEvent': {
                const decoded = this.decodeTokenCreatedEvent(data);
                return decoded ? { type: 'CREATE', data: decoded } : null;
            }
            case 'TokenGraduatedEvent': {
                const decoded = this.decodeTokenGraduatedEvent(data);
                return decoded ? { type: 'COMPLETE', data: decoded } : null;
            }
            default:
                return null;
        }
    }
}
exports.BoopfunDecoder = BoopfunDecoder;
// Export singleton instance for convenience
exports.boopfunDecoder = new BoopfunDecoder();
//# sourceMappingURL=boopfun-decoder.js.map