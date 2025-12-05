"use strict";
/**
 * MeteoraPoolsDecoder - IDL-based decoder for Meteora Pools (DAMM) program
 *
 * Program ID: Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB
 * Provides type-safe decoding of Meteora Pools instructions and events.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meteoraPoolsDecoder = exports.MeteoraPoolsDecoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const meteora_damm_v1_json_1 = __importDefault(require("../idls/meteora-damm-v1.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
class MeteoraPoolsDecoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(meteora_damm_v1_json_1.default);
    }
    /**
     * Check if data is a Meteora Pools event (has Anchor event prefix)
     */
    isMeteoraPoolsEvent(data) {
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
        if (!this.isMeteoraPoolsEvent(data))
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
     * Decode Swap event from raw data
     */
    decodeSwapEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'Swap')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseSwapEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode AddLiquidity event from raw data
     */
    decodeAddLiquidityEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'AddLiquidity')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseAddLiquidityEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode RemoveLiquidity event from raw data
     */
    decodeRemoveLiquidityEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'RemoveLiquidity')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseRemoveLiquidityEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode PoolCreated event from raw data
     */
    decodePoolCreatedEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'PoolCreated')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parsePoolCreatedEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse Swap event data (without prefix)
     */
    parseSwapEventData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const inMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const outMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const amountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const amountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const tradingFee = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFee = data.readBigUInt64LE(offset);
        offset += 8;
        const partnerFee = data.readBigUInt64LE(offset);
        offset += 8;
        const referralFee = data.readBigUInt64LE(offset);
        return {
            pool,
            inMint,
            outMint,
            amountIn,
            amountOut,
            tradingFee,
            protocolFee,
            partnerFee,
            referralFee,
        };
    }
    /**
     * Parse AddLiquidity event data (without prefix)
     */
    parseAddLiquidityEventData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const lpMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenAMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenBMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenAAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const tokenBAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const lpAmount = data.readBigUInt64LE(offset);
        return {
            pool,
            lpMint,
            tokenAMint,
            tokenBMint,
            tokenAAmount,
            tokenBAmount,
            lpAmount,
        };
    }
    /**
     * Parse RemoveLiquidity event data (without prefix)
     */
    parseRemoveLiquidityEventData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const lpMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenAMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenBMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenAAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const tokenBAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const lpAmount = data.readBigUInt64LE(offset);
        return {
            pool,
            lpMint,
            tokenAMint,
            tokenBMint,
            tokenAAmount,
            tokenBAmount,
            lpAmount,
        };
    }
    /**
     * Parse PoolCreated event data (without prefix)
     */
    parsePoolCreatedEventData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const lpMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenAMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenBMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            pool,
            lpMint,
            tokenAMint,
            tokenBMint,
        };
    }
    /**
     * Decode any Meteora Pools event based on discriminator
     */
    decodeAnyEvent(data) {
        const eventName = this.identifyEvent(data);
        if (!eventName)
            return null;
        switch (eventName) {
            case 'Swap': {
                const decoded = this.decodeSwapEvent(data);
                return decoded ? { type: 'SWAP', data: decoded } : null;
            }
            case 'AddLiquidity': {
                const decoded = this.decodeAddLiquidityEvent(data);
                return decoded ? { type: 'ADD_LIQUIDITY', data: decoded } : null;
            }
            case 'RemoveLiquidity': {
                const decoded = this.decodeRemoveLiquidityEvent(data);
                return decoded ? { type: 'REMOVE_LIQUIDITY', data: decoded } : null;
            }
            case 'PoolCreated': {
                const decoded = this.decodePoolCreatedEvent(data);
                return decoded ? { type: 'POOL_CREATED', data: decoded } : null;
            }
            default:
                return null;
        }
    }
    /**
     * Extract fees from Swap event
     */
    extractFeesFromEvent(data) {
        const eventName = this.identifyEvent(data);
        if (eventName !== 'Swap')
            return null;
        const decoded = this.decodeSwapEvent(data);
        if (decoded) {
            return {
                tradingFee: decoded.tradingFee,
                protocolFee: decoded.protocolFee,
                partnerFee: decoded.partnerFee,
                referralFee: decoded.referralFee,
            };
        }
        return null;
    }
}
exports.MeteoraPoolsDecoder = MeteoraPoolsDecoder;
// Export singleton instance for convenience
exports.meteoraPoolsDecoder = new MeteoraPoolsDecoder();
//# sourceMappingURL=meteora-pools-decoder.js.map