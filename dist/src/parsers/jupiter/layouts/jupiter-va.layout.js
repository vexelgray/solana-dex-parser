"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterVACloseLayout = exports.JupiterVAWithdrawLayout = exports.JupiterVADepositLayout = exports.JupiterVAOpenLayout = exports.JupiterVAFillLayout = void 0;
const bs58_1 = __importDefault(require("bs58"));
const binary_reader_1 = require("../../binary-reader");
class JupiterVAFillLayout {
    constructor(fields) {
        this.valueAverage = fields.valueAverage;
        this.user = fields.user;
        this.keeper = fields.keeper;
        this.inputMint = fields.inputMint;
        this.outputMint = fields.outputMint;
        this.inputAmount = fields.inputAmount;
        this.outputAmount = fields.outputAmount;
        this.fee = fields.fee;
        this.newActualUsdcValue = fields.newActualUsdcValue;
        this.supposedUsdcValue = fields.supposedUsdcValue;
        this.value = fields.value;
        this.inLeft = fields.inLeft;
        this.inUsed = fields.inUsed;
        this.outReceived = fields.outReceived;
    }
    toObject() {
        return {
            valueAverage: bs58_1.default.encode(this.valueAverage),
            user: bs58_1.default.encode(this.user),
            keeper: bs58_1.default.encode(this.keeper),
            inputMint: bs58_1.default.encode(this.inputMint),
            outputMint: bs58_1.default.encode(this.outputMint),
            inputAmount: this.inputAmount,
            outputAmount: this.outputAmount,
            fee: this.fee,
            newActualUsdcValue: this.newActualUsdcValue,
            supposedUsdcValue: this.supposedUsdcValue,
            value: this.value,
            inLeft: this.inLeft,
            inUsed: this.inUsed,
            outReceived: this.outReceived,
        };
    }
}
exports.JupiterVAFillLayout = JupiterVAFillLayout;
JupiterVAFillLayout.schema = new Map([
    [
        JupiterVAFillLayout,
        {
            kind: 'struct',
            fields: [
                ['valueAverage', [32]],
                ['user', [32]],
                ['keeper', [32]],
                ['inputMint', [32]],
                ['outputMint', [32]],
                ['inputAmount', 'u64'],
                ['outputAmount', 'u64'],
                ['fee', 'u64'],
                ['newActualUsdcValue', 'u64'],
                ['supposedUsdcValue', 'u64'],
                ['value', 'u64'],
                ['inLeft', 'u64'],
                ['inUsed', 'u64'],
                ['outReceived', 'u64'],
            ],
        },
    ],
]);
class JupiterVAOpenLayout {
    constructor(fields) {
        this.user = fields.user;
        this.valueAverage = fields.valueAverage;
        this.deposit = fields.deposit;
        this.inputMint = fields.inputMint;
        this.outputMint = fields.outputMint;
        this.referralFeeAccount = fields.referralFeeAccount;
        this.orderInterval = fields.orderInterval;
        this.incrementUsdcValue = fields.incrementUsdcValue;
        this.createdAt = fields.createdAt;
    }
    static deserialize(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const user = reader.readFixedArray(32);
        const valueAverage = reader.readFixedArray(32);
        const deposit = reader.readU64();
        const inputMint = reader.readFixedArray(32);
        const outputMint = reader.readFixedArray(32);
        const referralFeeAccount = reader.readFixedArray(32);
        const orderInterval = reader.readI64();
        const incrementUsdcValue = reader.readU64();
        const createdAt = reader.readI64();
        return new JupiterVAOpenLayout({
            user,
            valueAverage,
            deposit,
            inputMint,
            outputMint,
            referralFeeAccount,
            orderInterval,
            incrementUsdcValue,
            createdAt,
        });
    }
    toObject() {
        return {
            user: bs58_1.default.encode(this.user),
            valueAverage: bs58_1.default.encode(this.valueAverage),
            deposit: this.deposit,
            inputMint: bs58_1.default.encode(this.inputMint),
            outputMint: bs58_1.default.encode(this.outputMint),
            referralFeeAccount: bs58_1.default.encode(this.referralFeeAccount),
            orderInterval: this.orderInterval,
            incrementUsdcValue: this.incrementUsdcValue,
            createdAt: this.createdAt,
        };
    }
}
exports.JupiterVAOpenLayout = JupiterVAOpenLayout;
JupiterVAOpenLayout.schema = new Map([
    [
        JupiterVAOpenLayout,
        {
            kind: 'struct',
            fields: [
                ['user', [32]],
                ['valueAverage', [32]],
                ['deposit', 'u64'],
                ['inputMint', [32]],
                ['outputMint', [32]],
                ['referralFeeAccount', [32]],
                ['orderInterval', 'i64'],
                ['incrementUsdcValue', 'u64'],
                ['createdAt', 'i64'],
            ],
        },
    ],
]);
class JupiterVADepositLayout {
    constructor(fields) {
        this.depositor = fields.depositor;
        this.valueAverage = fields.valueAverage;
        this.mint = fields.mint;
        this.amount = fields.amount;
        this.inDeposited = fields.inDeposited;
        this.inLeft = fields.inLeft;
    }
    toObject() {
        return {
            depositor: bs58_1.default.encode(this.depositor),
            valueAverage: bs58_1.default.encode(this.valueAverage),
            mint: bs58_1.default.encode(this.mint),
            amount: this.amount,
            inDeposited: this.inDeposited,
            inLeft: this.inLeft,
        };
    }
}
exports.JupiterVADepositLayout = JupiterVADepositLayout;
JupiterVADepositLayout.schema = new Map([
    [
        JupiterVADepositLayout,
        {
            kind: 'struct',
            fields: [
                ['depositor', [32]],
                ['valueAverage', [32]],
                ['mint', [32]],
                ['amount', 'u64'],
                ['inDeposited', 'u64'],
                ['inLeft', 'u64'],
            ],
        },
    ],
]);
class JupiterVAWithdrawLayout {
    constructor(fields) {
        this.valueAverage = fields.valueAverage;
        this.mint = fields.mint;
        this.amount = fields.amount;
        this.inOrOut = fields.inOrOut;
        this.userWithdraw = fields.userWithdraw;
        this.inLeft = fields.inLeft;
        this.inWithdrawn = fields.inWithdrawn;
        this.outWithdrawn = fields.outWithdrawn;
    }
    static deserialize(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        const valueAverage = reader.readFixedArray(32);
        const mint = reader.readFixedArray(32);
        const amount = reader.readU64();
        const inOrOut = reader.readU8() == 0 ? 'In' : 'Out';
        const userWithdraw = reader.readU8() === 1;
        const inLeft = reader.readU64();
        const inWithdrawn = reader.readU64();
        const outWithdrawn = reader.readU64();
        return new JupiterVAWithdrawLayout({
            valueAverage,
            mint,
            amount,
            inOrOut,
            userWithdraw,
            inLeft,
            inWithdrawn,
            outWithdrawn,
        });
    }
    toObject() {
        return {
            valueAverage: bs58_1.default.encode(this.valueAverage),
            mint: bs58_1.default.encode(this.mint),
            amount: this.amount,
            inOrOut: this.inOrOut,
            userWithdraw: this.userWithdraw,
            inLeft: this.inLeft,
            inWithdrawn: this.inWithdrawn,
            outWithdrawn: this.outWithdrawn,
        };
    }
}
exports.JupiterVAWithdrawLayout = JupiterVAWithdrawLayout;
class JupiterVACloseLayout {
    constructor(fields) {
        this.user = fields.user;
        this.valueAverage = fields.valueAverage;
        this.createdAt = fields.createdAt;
        this.closedAt = fields.closedAt;
        this.executor = fields.executor;
    }
    toObject() {
        return {
            user: bs58_1.default.encode(this.user),
            valueAverage: bs58_1.default.encode(this.valueAverage),
            createdAt: this.createdAt,
            closedAt: this.closedAt,
            executor: bs58_1.default.encode(this.executor),
        };
    }
}
exports.JupiterVACloseLayout = JupiterVACloseLayout;
JupiterVACloseLayout.schema = new Map([
    [
        JupiterVACloseLayout,
        {
            kind: 'struct',
            fields: [
                ['user', [32]],
                ['valueAverage', [32]],
                ['createdAt', 'i64'],
                ['closedAt', 'i64'],
                ['executor', [32]],
            ],
        },
    ],
]);
//# sourceMappingURL=jupiter-va.layout.js.map