"use strict";
/**
 * MeteoraDAMMV2Decoder - IDL-based decoder for Meteora DAMM V2 (CP AMM) program
 *
 * Program ID: cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG
 * Provides type-safe decoding of Meteora DAMM V2 instructions and events.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meteoraDAMMV2Decoder = exports.MeteoraDAMMV2Decoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const meteora_damm_v2_json_1 = __importDefault(require("../idls/meteora-damm-v2.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
class MeteoraDAMMV2Decoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(meteora_damm_v2_json_1.default);
    }
    /**
     * Check if data is a Meteora DAMM V2 event (has Anchor event prefix)
     */
    isMeteoraDAMMV2Event(data) {
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
        if (!this.isMeteoraDAMMV2Event(data))
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
     * Decode EvtSwap from raw data
     */
    decodeEvtSwap(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'EvtSwap')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseEvtSwapData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode EvtAddLiquidity from raw data
     */
    decodeEvtAddLiquidity(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'EvtAddLiquidity')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseEvtAddLiquidityData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode EvtRemoveLiquidity from raw data
     */
    decodeEvtRemoveLiquidity(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'EvtRemoveLiquidity')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseEvtRemoveLiquidityData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode EvtInitializePool from raw data
     */
    decodeEvtInitializePool(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'EvtInitializePool')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseEvtInitializePoolData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode EvtCreatePosition from raw data
     */
    decodeEvtCreatePosition(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'EvtCreatePosition')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseEvtCreatePositionData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse EvtSwap data (without prefix)
     */
    parseEvtSwapData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tradeDirection = data.readUInt8(offset);
        offset += 1;
        const amountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const amountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFee = data.readBigUInt64LE(offset);
        offset += 8;
        const tradingFee = data.readBigUInt64LE(offset);
        offset += 8;
        const partnerFee = data.readBigUInt64LE(offset);
        offset += 8;
        const referralFee = data.readBigUInt64LE(offset);
        offset += 8;
        const currentTimestamp = data.readBigUInt64LE(offset);
        return {
            pool,
            tradeDirection,
            amountIn,
            amountOut,
            protocolFee,
            tradingFee,
            partnerFee,
            referralFee,
            currentTimestamp,
        };
    }
    /**
     * Parse EvtAddLiquidity data (without prefix)
     */
    parseEvtAddLiquidityData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const position = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const owner = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const amount0 = data.readBigUInt64LE(offset);
        offset += 8;
        const amount1 = data.readBigUInt64LE(offset);
        offset += 8;
        const liquidity = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
        offset += 16;
        const currentTimestamp = data.readBigUInt64LE(offset);
        return {
            pool,
            position,
            owner,
            amount0,
            amount1,
            liquidity,
            currentTimestamp,
        };
    }
    /**
     * Parse EvtRemoveLiquidity data (without prefix)
     */
    parseEvtRemoveLiquidityData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const position = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const owner = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const amount0 = data.readBigUInt64LE(offset);
        offset += 8;
        const amount1 = data.readBigUInt64LE(offset);
        offset += 8;
        const liquidity = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
        offset += 16;
        const currentTimestamp = data.readBigUInt64LE(offset);
        return {
            pool,
            position,
            owner,
            amount0,
            amount1,
            liquidity,
            currentTimestamp,
        };
    }
    /**
     * Parse EvtInitializePool data (without prefix)
     */
    parseEvtInitializePoolData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenMint0 = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const tokenMint1 = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const creator = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const sqrtPrice = data.readBigUInt64LE(offset) + (data.readBigUInt64LE(offset + 8) << 64n);
        offset += 16;
        const activationPoint = data.readBigUInt64LE(offset);
        offset += 8;
        const currentTimestamp = data.readBigUInt64LE(offset);
        return {
            pool,
            tokenMint0,
            tokenMint1,
            creator,
            sqrtPrice,
            activationPoint,
            currentTimestamp,
        };
    }
    /**
     * Parse EvtCreatePosition data (without prefix)
     */
    parseEvtCreatePositionData(data) {
        let offset = 0;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const position = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const owner = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const currentTimestamp = data.readBigUInt64LE(offset);
        return {
            pool,
            position,
            owner,
            currentTimestamp,
        };
    }
    /**
     * Decode any Meteora DAMM V2 event based on discriminator
     */
    decodeAnyEvent(data) {
        const eventName = this.identifyEvent(data);
        if (!eventName)
            return null;
        switch (eventName) {
            case 'EvtSwap': {
                const decoded = this.decodeEvtSwap(data);
                return decoded ? { type: 'SWAP', data: decoded } : null;
            }
            case 'EvtAddLiquidity': {
                const decoded = this.decodeEvtAddLiquidity(data);
                return decoded ? { type: 'ADD_LIQUIDITY', data: decoded } : null;
            }
            case 'EvtRemoveLiquidity': {
                const decoded = this.decodeEvtRemoveLiquidity(data);
                return decoded ? { type: 'REMOVE_LIQUIDITY', data: decoded } : null;
            }
            case 'EvtInitializePool': {
                const decoded = this.decodeEvtInitializePool(data);
                return decoded ? { type: 'INITIALIZE_POOL', data: decoded } : null;
            }
            case 'EvtCreatePosition': {
                const decoded = this.decodeEvtCreatePosition(data);
                return decoded ? { type: 'CREATE_POSITION', data: decoded } : null;
            }
            default:
                return null;
        }
    }
    /**
     * Extract fees from EvtSwap event
     */
    extractFeesFromEvent(data) {
        const eventName = this.identifyEvent(data);
        if (eventName !== 'EvtSwap')
            return null;
        const decoded = this.decodeEvtSwap(data);
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
exports.MeteoraDAMMV2Decoder = MeteoraDAMMV2Decoder;
// Export singleton instance for convenience
exports.meteoraDAMMV2Decoder = new MeteoraDAMMV2Decoder();
//# sourceMappingURL=meteora-damm-v2-decoder.js.map