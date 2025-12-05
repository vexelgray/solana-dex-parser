"use strict";
/**
 * RaydiumLaunchpadDecoder - IDL-based decoder for Raydium Launchpad (LCP) program
 *
 * Provides type-safe decoding of Raydium Launchpad instructions and events
 * using the official IDL from bitquery/solana-idl-lib.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raydiumLaunchpadDecoder = exports.RaydiumLaunchpadDecoder = exports.PoolStatus = exports.TradeDirection = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const raydium_launchpad_json_1 = __importDefault(require("../idls/raydium-launchpad.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
// Trade direction enum
var TradeDirection;
(function (TradeDirection) {
    TradeDirection[TradeDirection["Buy"] = 0] = "Buy";
    TradeDirection[TradeDirection["Sell"] = 1] = "Sell";
})(TradeDirection || (exports.TradeDirection = TradeDirection = {}));
// Pool status enum
var PoolStatus;
(function (PoolStatus) {
    PoolStatus[PoolStatus["Trading"] = 0] = "Trading";
    PoolStatus[PoolStatus["Migrated"] = 1] = "Migrated";
})(PoolStatus || (exports.PoolStatus = PoolStatus = {}));
class RaydiumLaunchpadDecoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(raydium_launchpad_json_1.default);
    }
    /**
     * Check if data is a Raydium Launchpad event (has Anchor event prefix)
     */
    isRaydiumLCPEvent(data) {
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
        if (!this.isRaydiumLCPEvent(data))
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
     * Decode TradeEvent from raw data (expects full Anchor event with 16-byte prefix)
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
     * Parse TradeEvent from raw data (data should already have 16-byte prefix stripped)
     * Use this when the caller has already validated the discriminator
     */
    parseTradeEventDirect(data) {
        const buffer = buffer_1.Buffer.from(data);
        return this.parseTradeEventData(buffer);
    }
    /**
     * Decode PoolCreateEvent from raw data
     */
    decodePoolCreateEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'PoolCreateEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parsePoolCreateEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse TradeEvent data (without prefix)
     *
     * There are multiple on-chain versions:
     * - V1 (130 bytes): 12 u64 fields, NO creator_fee, NO exact_in
     *   Fields: pool_state + total_base_sell + virtual_base + virtual_quote +
     *           real_base_before + real_quote_before + real_base_after + real_quote_after +
     *           amount_in + amount_out + protocol_fee + platform_fee + share_fee +
     *           trade_direction + pool_status
     * - V2 (138 bytes): 13 u64 fields, HAS creator_fee, NO exact_in
     *   Same as V1 + creator_fee between platform_fee and share_fee
     * - V3/IDL (139 bytes): Same as V2 + exact_in (1 byte)
     *
     * Byte breakdown:
     * - pool_state: pubkey (32)
     * - 11-13 u64 fields depending on version (88-104 bytes)
     * - trade_direction: u8 (1)
     * - pool_status: u8 (1)
     * - [exact_in: bool (1)] - V3/IDL only
     */
    parseTradeEventData(data) {
        const dataLen = data.length;
        // V1 = 130 bytes (no creator_fee), V2 = 138 bytes (has creator_fee), V3 = 139 bytes (has exact_in)
        const hasCreatorFee = dataLen >= 138;
        const hasExactIn = dataLen >= 139;
        let offset = 0;
        const poolState = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const totalBaseSell = data.readBigUInt64LE(offset);
        offset += 8;
        const virtualBase = data.readBigUInt64LE(offset);
        offset += 8;
        const virtualQuote = data.readBigUInt64LE(offset);
        offset += 8;
        const realBaseBefore = data.readBigUInt64LE(offset);
        offset += 8;
        const realQuoteBefore = data.readBigUInt64LE(offset);
        offset += 8;
        const realBaseAfter = data.readBigUInt64LE(offset);
        offset += 8;
        const realQuoteAfter = data.readBigUInt64LE(offset);
        offset += 8;
        const amountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const amountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFee = data.readBigUInt64LE(offset);
        offset += 8;
        const platformFee = data.readBigUInt64LE(offset);
        offset += 8;
        // creator_fee only in V2+
        const creatorFee = hasCreatorFee ? data.readBigUInt64LE(offset) : 0n;
        if (hasCreatorFee)
            offset += 8;
        const shareFee = data.readBigUInt64LE(offset);
        offset += 8;
        const tradeDirection = data.readUInt8(offset);
        offset += 1;
        const poolStatus = data.readUInt8(offset);
        offset += 1;
        // exact_in only in V3/IDL
        const exactIn = hasExactIn ? data.readUInt8(offset) === 1 : true;
        return {
            poolState,
            totalBaseSell,
            virtualBase,
            virtualQuote,
            realBaseBefore,
            realQuoteBefore,
            realBaseAfter,
            realQuoteAfter,
            amountIn,
            amountOut,
            protocolFee,
            platformFee,
            creatorFee,
            shareFee,
            tradeDirection,
            poolStatus,
            exactIn,
        };
    }
    /**
     * Parse PoolCreateEvent data (without prefix)
     * Note: This is a simplified parser - complex nested types (CurveParams, VestingParams)
     * are handled in the existing Borsh layout classes
     */
    parsePoolCreateEventData(data) {
        let offset = 0;
        const poolState = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const creator = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const config = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        // MintParams: decimals (1) + name (4 + len) + symbol (4 + len) + uri (4 + len)
        const decimals = data.readUInt8(offset);
        offset += 1;
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
        // CurveParams is a Rust enum - first byte is variant, then data
        const curveVariant = data.readUInt8(offset);
        offset += 1;
        // For now, return basic curve info - detailed parsing done by existing Borsh layouts
        const curveVariantNames = ['Constant', 'Fixed', 'Linear'];
        return {
            poolState,
            creator,
            config,
            baseMintParam: {
                decimals,
                name,
                symbol,
                uri,
            },
            curveParam: {
                variant: curveVariantNames[curveVariant] || 'Unknown',
                data: null, // Complex curve data handled by existing layouts
            },
            vestingParam: null, // Complex vesting data handled by existing layouts
            ammFeeOn: null, // AMM fee data handled by existing layouts
        };
    }
    /**
     * Decode any Raydium Launchpad event based on discriminator
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
            case 'PoolCreateEvent': {
                const decoded = this.decodePoolCreateEvent(data);
                return decoded ? { type: 'CREATE', data: decoded } : null;
            }
            default:
                return null;
        }
    }
}
exports.RaydiumLaunchpadDecoder = RaydiumLaunchpadDecoder;
// Export singleton instance for convenience
exports.raydiumLaunchpadDecoder = new RaydiumLaunchpadDecoder();
//# sourceMappingURL=raydium-launchpad-decoder.js.map