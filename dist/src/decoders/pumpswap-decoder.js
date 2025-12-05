"use strict";
/**
 * PumpswapDecoder - IDL-based decoder for Pumpswap AMM program events
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pumpswapDecoder = exports.PumpswapDecoder = void 0;
const bs58_1 = __importDefault(require("bs58"));
const buffer_1 = require("buffer");
const idl_decoder_1 = require("./idl-decoder");
const pumpswap_json_1 = __importDefault(require("../idls/pumpswap.json"));
// Anchor self-CPI event prefix (8 bytes)
const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
// Pumpswap mayhem mode fee recipient
const MAYHEM_FEE_RECIPIENT = 'GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS';
class PumpswapDecoder extends idl_decoder_1.IdlDecoder {
    constructor() {
        super(pumpswap_json_1.default);
    }
    isPumpswapEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return false;
        return buffer.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX);
    }
    getEventDiscriminatorFromData(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        return buffer.subarray(8, 16);
    }
    identifyEvent(data) {
        if (!this.isPumpswapEvent(data))
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
    decodeBuyEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'BuyEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseBuyEventData(eventData);
        }
        catch {
            return null;
        }
    }
    decodeSellEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'SellEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseSellEventData(eventData);
        }
        catch {
            return null;
        }
    }
    decodeCreatePoolEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'CreatePoolEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseCreatePoolEventData(eventData);
        }
        catch {
            return null;
        }
    }
    decodeDepositEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'DepositEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseDepositEventData(eventData);
        }
        catch {
            return null;
        }
    }
    decodeWithdrawEvent(data) {
        const buffer = buffer_1.Buffer.from(data);
        if (buffer.length < 16)
            return null;
        const eventName = this.identifyEvent(buffer);
        if (eventName !== 'WithdrawEvent')
            return null;
        try {
            const eventData = buffer.subarray(16);
            return this.parseWithdrawEventData(eventData);
        }
        catch {
            return null;
        }
    }
    parseBuyEventData(data) {
        let offset = 0;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const baseAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const maxQuoteAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const userBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const userQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const lpFeeBasisPoints = data.readBigUInt64LE(offset);
        offset += 8;
        const lpFee = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFeeBasisPoints = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFee = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountInWithLpFee = data.readBigUInt64LE(offset);
        offset += 8;
        const userQuoteAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userBaseTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userQuoteTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const protocolFeeRecipient = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const protocolFeeRecipientTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const result = {
            timestamp,
            baseAmountOut,
            maxQuoteAmountIn,
            userBaseTokenReserves,
            userQuoteTokenReserves,
            poolBaseTokenReserves,
            poolQuoteTokenReserves,
            quoteAmountIn,
            lpFeeBasisPoints,
            lpFee,
            protocolFeeBasisPoints,
            protocolFee,
            quoteAmountInWithLpFee,
            userQuoteAmountIn,
            pool,
            user,
            userBaseTokenAccount,
            userQuoteTokenAccount,
            protocolFeeRecipient,
            protocolFeeRecipientTokenAccount,
            isMayhemMode: protocolFeeRecipient === MAYHEM_FEE_RECIPIENT,
        };
        // Optional coin creator fields
        if (data.length - offset >= 48) {
            result.coinCreator = bs58_1.default.encode(data.subarray(offset, offset + 32));
            offset += 32;
            result.coinCreatorFeeBasisPoints = data.readBigUInt64LE(offset);
            offset += 8;
            result.coinCreatorFee = data.readBigUInt64LE(offset);
        }
        return result;
    }
    parseSellEventData(data) {
        let offset = 0;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const baseAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const minQuoteAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const userBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const userQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const lpFeeBasisPoints = data.readBigUInt64LE(offset);
        offset += 8;
        const lpFee = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFeeBasisPoints = data.readBigUInt64LE(offset);
        offset += 8;
        const protocolFee = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountOutWithoutLpFee = data.readBigUInt64LE(offset);
        offset += 8;
        const userQuoteAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userBaseTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userQuoteTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const protocolFeeRecipient = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const protocolFeeRecipientTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const result = {
            timestamp,
            baseAmountIn,
            minQuoteAmountOut,
            userBaseTokenReserves,
            userQuoteTokenReserves,
            poolBaseTokenReserves,
            poolQuoteTokenReserves,
            quoteAmountOut,
            lpFeeBasisPoints,
            lpFee,
            protocolFeeBasisPoints,
            protocolFee,
            quoteAmountOutWithoutLpFee,
            userQuoteAmountOut,
            pool,
            user,
            userBaseTokenAccount,
            userQuoteTokenAccount,
            protocolFeeRecipient,
            protocolFeeRecipientTokenAccount,
            isMayhemMode: protocolFeeRecipient === MAYHEM_FEE_RECIPIENT,
        };
        if (data.length - offset >= 48) {
            result.coinCreator = bs58_1.default.encode(data.subarray(offset, offset + 32));
            offset += 32;
            result.coinCreatorFeeBasisPoints = data.readBigUInt64LE(offset);
            offset += 8;
            result.coinCreatorFee = data.readBigUInt64LE(offset);
        }
        return result;
    }
    parseCreatePoolEventData(data) {
        let offset = 0;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const index = data.readUInt16LE(offset);
        offset += 2;
        const creator = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const baseMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const quoteMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const baseMintDecimals = data.readUInt8(offset);
        offset += 1;
        const quoteMintDecimals = data.readUInt8(offset);
        offset += 1;
        const baseAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const poolBaseAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const poolQuoteAmount = data.readBigUInt64LE(offset);
        offset += 8;
        const minimumLiquidity = data.readBigUInt64LE(offset);
        offset += 8;
        const initialLiquidity = data.readBigUInt64LE(offset);
        offset += 8;
        const lpTokenAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const poolBump = data.readUInt8(offset);
        offset += 1;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const lpMint = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userBaseTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userQuoteTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            timestamp,
            index,
            creator,
            baseMint,
            quoteMint,
            baseMintDecimals,
            quoteMintDecimals,
            baseAmountIn,
            quoteAmountIn,
            poolBaseAmount,
            poolQuoteAmount,
            minimumLiquidity,
            initialLiquidity,
            lpTokenAmountOut,
            poolBump,
            pool,
            lpMint,
            userBaseTokenAccount,
            userQuoteTokenAccount,
        };
    }
    parseDepositEventData(data) {
        let offset = 0;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const lpTokenAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const maxBaseAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const maxQuoteAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const userBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const userQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const baseAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const lpMintSupply = data.readBigUInt64LE(offset);
        offset += 8;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userBaseTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userQuoteTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userPoolTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            timestamp,
            lpTokenAmountOut,
            maxBaseAmountIn,
            maxQuoteAmountIn,
            userBaseTokenReserves,
            userQuoteTokenReserves,
            poolBaseTokenReserves,
            poolQuoteTokenReserves,
            baseAmountIn,
            quoteAmountIn,
            lpMintSupply,
            pool,
            user,
            userBaseTokenAccount,
            userQuoteTokenAccount,
            userPoolTokenAccount,
        };
    }
    parseWithdrawEventData(data) {
        let offset = 0;
        const timestamp = data.readBigInt64LE(offset);
        offset += 8;
        const lpTokenAmountIn = data.readBigUInt64LE(offset);
        offset += 8;
        const minBaseAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const minQuoteAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const userBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const userQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolBaseTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const poolQuoteTokenReserves = data.readBigUInt64LE(offset);
        offset += 8;
        const baseAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const quoteAmountOut = data.readBigUInt64LE(offset);
        offset += 8;
        const lpMintSupply = data.readBigUInt64LE(offset);
        offset += 8;
        const pool = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const user = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userBaseTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userQuoteTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        offset += 32;
        const userPoolTokenAccount = bs58_1.default.encode(data.subarray(offset, offset + 32));
        return {
            timestamp,
            lpTokenAmountIn,
            minBaseAmountOut,
            minQuoteAmountOut,
            userBaseTokenReserves,
            userQuoteTokenReserves,
            poolBaseTokenReserves,
            poolQuoteTokenReserves,
            baseAmountOut,
            quoteAmountOut,
            lpMintSupply,
            pool,
            user,
            userBaseTokenAccount,
            userQuoteTokenAccount,
            userPoolTokenAccount,
        };
    }
    decodeAnyEvent(data) {
        const eventName = this.identifyEvent(data);
        if (!eventName)
            return null;
        switch (eventName) {
            case 'BuyEvent': {
                const decoded = this.decodeBuyEvent(data);
                return decoded ? { type: 'BUY', data: decoded } : null;
            }
            case 'SellEvent': {
                const decoded = this.decodeSellEvent(data);
                return decoded ? { type: 'SELL', data: decoded } : null;
            }
            case 'CreatePoolEvent': {
                const decoded = this.decodeCreatePoolEvent(data);
                return decoded ? { type: 'CREATE', data: decoded } : null;
            }
            case 'DepositEvent': {
                const decoded = this.decodeDepositEvent(data);
                return decoded ? { type: 'ADD', data: decoded } : null;
            }
            case 'WithdrawEvent': {
                const decoded = this.decodeWithdrawEvent(data);
                return decoded ? { type: 'REMOVE', data: decoded } : null;
            }
            default:
                return null;
        }
    }
}
exports.PumpswapDecoder = PumpswapDecoder;
exports.pumpswapDecoder = new PumpswapDecoder();
//# sourceMappingURL=pumpswap-decoder.js.map