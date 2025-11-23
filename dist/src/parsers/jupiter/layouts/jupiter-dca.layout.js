"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterDCAFilledLayout = void 0;
const bs58_1 = __importDefault(require("bs58"));
class JupiterDCAFilledLayout {
    constructor(fields) {
        this.userKey = fields.userKey;
        this.dcaKey = fields.dcaKey;
        this.inputMint = fields.inputMint;
        this.outputMint = fields.outputMint;
        this.inAmount = fields.inAmount;
        this.outAmount = fields.outAmount;
        this.feeMint = fields.feeMint;
        this.fee = fields.fee;
    }
    toObject() {
        return {
            userKey: bs58_1.default.encode(this.userKey),
            dcaKey: bs58_1.default.encode(this.dcaKey),
            inputMint: bs58_1.default.encode(this.inputMint),
            outputMint: bs58_1.default.encode(this.outputMint),
            inAmount: this.inAmount,
            outAmount: this.outAmount,
            feeMint: bs58_1.default.encode(this.feeMint),
            fee: this.fee,
        };
    }
}
exports.JupiterDCAFilledLayout = JupiterDCAFilledLayout;
JupiterDCAFilledLayout.schema = new Map([
    [
        JupiterDCAFilledLayout,
        {
            kind: 'struct',
            fields: [
                ['userKey', [32]],
                ['dcaKey', [32]],
                ['inputMint', [32]],
                ['outputMint', [32]],
                ['inAmount', 'u64'],
                ['outAmount', 'u64'],
                ['feeMint', [32]],
                ['fee', 'u64'],
            ],
        },
    ],
]);
//# sourceMappingURL=jupiter-dca.layout.js.map