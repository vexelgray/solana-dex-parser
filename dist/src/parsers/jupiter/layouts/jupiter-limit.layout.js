"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterLimitOrderV2CreateOrderLayout = exports.JupiterLimitOrderV2TradeLayout = void 0;
const bs58_1 = __importDefault(require("bs58"));
const binary_reader_1 = require("../../binary-reader");
class JupiterLimitOrderV2TradeLayout {
    constructor(fields) {
        this.orderKey = fields.orderKey;
        this.taker = fields.taker;
        this.remainingMakingAmount = fields.remainingMakingAmount;
        this.remainingTakingAmount = fields.remainingTakingAmount;
        this.makingAmount = fields.makingAmount;
        this.takingAmount = fields.takingAmount;
    }
    toObject() {
        return {
            orderKey: bs58_1.default.encode(this.orderKey),
            taker: bs58_1.default.encode(this.taker),
            remainingMakingAmount: this.remainingMakingAmount,
            remainingTakingAmount: this.remainingTakingAmount,
            makingAmount: this.makingAmount,
            takingAmount: this.takingAmount,
        };
    }
}
exports.JupiterLimitOrderV2TradeLayout = JupiterLimitOrderV2TradeLayout;
JupiterLimitOrderV2TradeLayout.schema = new Map([
    [
        JupiterLimitOrderV2TradeLayout,
        {
            kind: 'struct',
            fields: [
                ['orderKey', [32]],
                ['taker', [32]],
                ['remainingMakingAmount', 'u64'],
                ['remainingTakingAmount', 'u64'],
                ['makingAmount', 'u64'],
                ['takingAmount', 'u64'],
            ],
        },
    ],
]);
class JupiterLimitOrderV2CreateOrderLayout {
    constructor(fields) {
        this.orderKey = fields.orderKey;
        this.maker = fields.maker;
        this.inputMint = fields.inputMint;
        this.outputMint = fields.outputMint;
        this.inputTokenProgram = fields.inputTokenProgram;
        this.outputTokenProgram = fields.outputTokenProgram;
        this.makingAmount = fields.makingAmount;
        this.takingAmount = fields.takingAmount;
        this.expiredAt = fields.expiredAt;
        this.feeBps = fields.feeBps;
        this.feeAccount = fields.feeAccount;
    }
    static deserialize(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const orderKey = reader.readFixedArray(32);
        const maker = reader.readFixedArray(32);
        const inputMint = reader.readFixedArray(32);
        const outputMint = reader.readFixedArray(32);
        const inputTokenProgram = reader.readFixedArray(32);
        const outputTokenProgram = reader.readFixedArray(32);
        const makingAmount = reader.readU64();
        const takingAmount = reader.readU64();
        // Handle optional expiredAt
        const expiredAtDiscriminator = reader.readU8(); // Read 1-byte discriminator
        let expiredAt = null;
        if (expiredAtDiscriminator === 1) {
            expiredAt = reader.readI64(); // Read i64 only if value is present
        }
        const feeBps = reader.readU16();
        const feeAccount = reader.readFixedArray(32);
        return new JupiterLimitOrderV2CreateOrderLayout({
            orderKey,
            maker,
            inputMint,
            outputMint,
            inputTokenProgram,
            outputTokenProgram,
            makingAmount,
            takingAmount,
            expiredAt,
            feeBps,
            feeAccount,
        });
    }
    toObject() {
        return {
            orderKey: bs58_1.default.encode(this.orderKey),
            maker: bs58_1.default.encode(this.maker),
            inputMint: bs58_1.default.encode(this.inputMint),
            outputMint: bs58_1.default.encode(this.outputMint),
            inputTokenProgram: bs58_1.default.encode(this.inputTokenProgram),
            outputTokenProgram: bs58_1.default.encode(this.outputTokenProgram),
            makingAmount: this.makingAmount,
            takingAmount: this.takingAmount,
            expiredAt: this.expiredAt !== null ? this.expiredAt.toString() : null,
            feeBps: this.feeBps,
            feeAccount: bs58_1.default.encode(this.feeAccount),
        };
    }
}
exports.JupiterLimitOrderV2CreateOrderLayout = JupiterLimitOrderV2CreateOrderLayout;
JupiterLimitOrderV2CreateOrderLayout.schema = new Map([
    [
        JupiterLimitOrderV2CreateOrderLayout,
        {
            kind: 'struct',
            fields: [
                ['orderKey', [32]],
                ['maker', [32]],
                ['inputMint', [32]],
                ['outputMint', [32]],
                ['inputTokenProgram', [32]],
                ['outputTokenProgram', [32]],
                ['makingAmount', 'u64'],
                ['takingAmount', 'u64'],
                ['expiredAt', { option: 'i64' }],
                ['feeBps', 'u16'],
                ['feeAccount', [32]],
            ],
        },
    ],
]);
//# sourceMappingURL=jupiter-limit.layout.js.map