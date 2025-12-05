"use strict";
/**
 * HeavenDecoder - IDL-based decoder for Heaven program events
 *
 * Provides type-safe decoding of Heaven instructions and events
 * using the official IDL.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.heavenDecoder = exports.HeavenDecoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const heaven_json_1 = __importDefault(require("../idls/heaven.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
class HeavenDecoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(heaven_json_1.default);
    }
    /**
     * Check if data is a Heaven event (has Anchor event prefix)
     */
    isHeavenEvent(data) {
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
        if (!this.isHeavenEvent(data))
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
            const eventData = buffer.subarray(16);
            return this.parseTradeEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode CreateLiquidityPoolEvent from raw data
     */
    decodeCreateLiquidityPoolEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'CreateLiquidityPoolEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseCreateLiquidityPoolEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Decode UserDefinedEvent from raw data
     */
    decodeUserDefinedEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'UserDefinedEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseUserDefinedEventData(eventData);
        }
        catch {
            return null;
        }
    }
    /**
     * Parse TradeEvent data (without prefix)
     * Fields: base_reserve, quote_reserve, total_creator_trading_fees, total_fee_paid
     */
    parseTradeEventData(data) {
        let offset = 0;
        const baseReserve = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteReserve = data.readBigUInt64LE(offset);
        offset += 8;
        const totalCreatorTradingFees = data.readBigUInt64LE(offset);
        offset += 8;
        const totalFeePaid = data.readBigUInt64LE(offset);
        return {
            baseReserve,
            quoteReserve,
            totalCreatorTradingFees,
            totalFeePaid,
        };
    }
    /**
     * Parse CreateLiquidityPoolEvent data (without prefix)
     * Fields: liquidity_pool_id, user, base_token_input_transfer_fee_amount,
     *         quote_token_input_transfer_fee_amount, base_token_input_amount,
     *         quote_token_input_amount, lp_token_output_amount
     */
    parseCreateLiquidityPoolEventData(data) {
        let offset = 0;
        const liquidityPoolId = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const baseTokenInputTransferFeeAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteTokenInputTransferFeeAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const baseTokenInputAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteTokenInputAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const lpTokenOutputAmount = data.readBigUInt64LE(offset);
        return {
            liquidityPoolId,
            user,
            baseTokenInputTransferFeeAmount,
            quoteTokenInputTransferFeeAmount,
            baseTokenInputAmount,
            quoteTokenInputAmount,
            lpTokenOutputAmount,
        };
    }
    /**
     * Parse UserDefinedEvent data (without prefix)
     * Fields: liquidity_pool_id, instruction_name, base64_data
     */
    parseUserDefinedEventData(data) {
        let offset = 0;
        const liquidityPoolId = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        // Read string fields (borsh format: 4-byte length prefix + utf8)
        const instructionNameLen = data.readUInt32LE(offset);
        offset += 4;
        const instructionName = data.subarray(offset, offset + instructionNameLen).toString('utf8');
        offset += instructionNameLen;
        const base64DataLen = data.readUInt32LE(offset);
        offset += 4;
        const base64Data = data.subarray(offset, offset + base64DataLen).toString('utf8');
        return {
            liquidityPoolId,
            instructionName,
            base64Data,
        };
    }
    /**
     * Decode any Heaven event based on discriminator
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
            case 'CreateLiquidityPoolEvent': {
                const decoded = this.decodeCreateLiquidityPoolEvent(data);
                return decoded ? { type: 'CREATE', data: decoded } : null;
            }
            case 'UserDefinedEvent': {
                const decoded = this.decodeUserDefinedEvent(data);
                return decoded ? { type: 'USER_DEFINED', data: decoded } : null;
            }
            default:
                return null;
        }
    }
}
exports.HeavenDecoder = HeavenDecoder;
// Export singleton instance for convenience
exports.heavenDecoder = new HeavenDecoder();
//# sourceMappingURL=heaven-decoder.js.map