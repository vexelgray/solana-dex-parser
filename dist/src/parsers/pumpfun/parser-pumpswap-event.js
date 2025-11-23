"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpswapEventParser = void 0;
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const utils_1 = require("../../utils");
const binary_reader_1 = require("../binary-reader");
// Pumpfun mayhem mode fee recipient
const MAYHEM_FEE_RECIPIENT = 'GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS';
class PumpswapEventParser {
    constructor(adapter) {
        this.adapter = adapter;
        this.eventParsers = {
            CREATE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.CREATE_POOL_EVENT,
                decode: this.decodeCreateEvent.bind(this),
            },
            ADD: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.ADD_LIQUIDITY_EVENT,
                decode: this.decodeAddLiquidity.bind(this),
            },
            REMOVE: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.REMOVE_LIQUIDITY_EVENT,
                decode: this.decodeRemoveLiquidity.bind(this),
            },
            BUY: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.BUY_EVENT,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminator: constants_1.DISCRIMINATORS.PUMPSWAP.SELL_EVENT,
                decode: this.decodeSellEvent.bind(this),
            },
        };
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.PUMP_SWAP.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = Buffer.from(data.slice(0, 16));
                for (const [type, parser] of Object.entries(this.eventParsers)) {
                    if (discriminator.equals(parser.discriminator)) {
                        const eventData = parser.decode(data.slice(16));
                        if (!eventData)
                            return null;
                        const event = {
                            type: type,
                            data: eventData,
                            slot: this.adapter.slot,
                            timestamp: this.adapter.blockTime || 0,
                            signature: this.adapter.signature,
                            idx: `${outerIndex}-${innerIndex ?? 0}`,
                        };
                        return event;
                    }
                }
            }
            catch (error) {
                console.error('Failed to parse Pumpswap event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeBuyEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const buyEvent = {
            timestamp: Number(reader.readI64()),
            baseAmountOut: reader.readU64(),
            maxQuoteAmountIn: reader.readU64(),
            userBaseTokenReserves: reader.readU64(),
            userQuoteTokenReserves: reader.readU64(),
            poolBaseTokenReserves: reader.readU64(),
            poolQuoteTokenReserves: reader.readU64(),
            quoteAmountIn: reader.readU64(),
            lpFeeBasisPoints: reader.readU64(),
            lpFee: reader.readU64(),
            protocolFeeBasisPoints: reader.readU64(),
            protocolFee: reader.readU64(),
            quoteAmountInWithLpFee: reader.readU64(),
            userQuoteAmountIn: reader.readU64(),
            pool: reader.readPubkey(),
            user: reader.readPubkey(),
            userBaseTokenAccount: reader.readPubkey(),
            userQuoteTokenAccount: reader.readPubkey(),
            protocolFeeRecipient: reader.readPubkey(),
            protocolFeeRecipientTokenAccount: reader.readPubkey(),
            coinCreator: data.length > 304 ? reader.readPubkey() : '11111111111111111111111111111111',
            coinCreatorFeeBasisPoints: data.length > 304 ? reader.readU64() : 0n,
            coinCreatorFee: data.length > 304 ? reader.readU64() : 0n,
            isMayhemMode: false,
        };
        // Check if this is a mayhem mode trade
        buyEvent.isMayhemMode = buyEvent.protocolFeeRecipient === MAYHEM_FEE_RECIPIENT;
        return buyEvent;
    }
    decodeSellEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const sellEvent = {
            timestamp: Number(reader.readI64()),
            baseAmountIn: reader.readU64(),
            minQuoteAmountOut: reader.readU64(),
            userBaseTokenReserves: reader.readU64(),
            userQuoteTokenReserves: reader.readU64(),
            poolBaseTokenReserves: reader.readU64(),
            poolQuoteTokenReserves: reader.readU64(),
            quoteAmountOut: reader.readU64(),
            lpFeeBasisPoints: reader.readU64(),
            lpFee: reader.readU64(),
            protocolFeeBasisPoints: reader.readU64(),
            protocolFee: reader.readU64(),
            quoteAmountOutWithoutLpFee: reader.readU64(),
            userQuoteAmountOut: reader.readU64(),
            pool: reader.readPubkey(),
            user: reader.readPubkey(),
            userBaseTokenAccount: reader.readPubkey(),
            userQuoteTokenAccount: reader.readPubkey(),
            protocolFeeRecipient: reader.readPubkey(),
            protocolFeeRecipientTokenAccount: reader.readPubkey(),
            coinCreator: data.length > 304 ? reader.readPubkey() : '11111111111111111111111111111111',
            coinCreatorFeeBasisPoints: data.length > 304 ? reader.readU64() : 0n,
            coinCreatorFee: data.length > 304 ? reader.readU64() : 0n,
            isMayhemMode: false,
        };
        // Check if this is a mayhem mode trade
        sellEvent.isMayhemMode = sellEvent.protocolFeeRecipient === MAYHEM_FEE_RECIPIENT;
        return sellEvent;
    }
    decodeAddLiquidity(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        return {
            timestamp: Number(reader.readI64()),
            lpTokenAmountOut: reader.readU64(),
            maxBaseAmountIn: reader.readU64(),
            maxQuoteAmountIn: reader.readU64(),
            userBaseTokenReserves: reader.readU64(),
            userQuoteTokenReserves: reader.readU64(),
            poolBaseTokenReserves: reader.readU64(),
            poolQuoteTokenReserves: reader.readU64(),
            baseAmountIn: reader.readU64(),
            quoteAmountIn: reader.readU64(),
            lpMintSupply: reader.readU64(),
            pool: reader.readPubkey(),
            user: reader.readPubkey(),
            userBaseTokenAccount: reader.readPubkey(),
            userQuoteTokenAccount: reader.readPubkey(),
            userPoolTokenAccount: reader.readPubkey(),
        };
    }
    decodeCreateEvent(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        return {
            timestamp: Number(reader.readI64()),
            index: reader.readU16(),
            creator: reader.readPubkey(),
            baseMint: reader.readPubkey(),
            quoteMint: reader.readPubkey(),
            baseMintDecimals: reader.readU8(),
            quoteMintDecimals: reader.readU8(),
            baseAmountIn: reader.readU64(),
            quoteAmountIn: reader.readU64(),
            poolBaseAmount: reader.readU64(),
            poolQuotAmount: reader.readU64(),
            minimumLiquidity: reader.readU64(),
            initialLiquidity: reader.readU64(),
            lpTokenAmountOut: reader.readU64(),
            poolBump: reader.readU8(),
            pool: reader.readPubkey(),
            lpMint: reader.readPubkey(),
            userBaseTokenAccount: reader.readPubkey(),
            userQuoteTokenAccount: reader.readPubkey(),
        };
    }
    decodeRemoveLiquidity(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        return {
            timestamp: Number(reader.readI64()),
            lpTokenAmountIn: reader.readU64(),
            minBaseAmountOut: reader.readU64(),
            minQuoteAmountOut: reader.readU64(),
            userBaseTokenReserves: reader.readU64(),
            userQuoteTokenReserves: reader.readU64(),
            poolBaseTokenReserves: reader.readU64(),
            poolQuoteTokenReserves: reader.readU64(),
            baseAmountOut: reader.readU64(),
            quoteAmountOut: reader.readU64(),
            lpMintSupply: reader.readU64(),
            pool: reader.readPubkey(),
            user: reader.readPubkey(),
            userBaseTokenAccount: reader.readPubkey(),
            userQuoteTokenAccount: reader.readPubkey(),
            userPoolTokenAccount: reader.readPubkey(),
        };
    }
}
exports.PumpswapEventParser = PumpswapEventParser;
//# sourceMappingURL=parser-pumpswap-event.js.map