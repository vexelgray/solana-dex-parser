"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterSwapLayout = void 0;
const web3_js_1 = require("@solana/web3.js");
class JupiterSwapLayout {
    constructor(fields) {
        this.amm = fields.amm;
        this.inputMint = fields.inputMint;
        this.inputAmount = fields.inputAmount;
        this.outputMint = fields.outputMint;
        this.outputAmount = fields.outputAmount;
    }
    toSwapEvent() {
        return {
            amm: new web3_js_1.PublicKey(this.amm),
            inputMint: new web3_js_1.PublicKey(this.inputMint),
            inputAmount: this.inputAmount,
            outputMint: new web3_js_1.PublicKey(this.outputMint),
            outputAmount: this.outputAmount,
        };
    }
}
exports.JupiterSwapLayout = JupiterSwapLayout;
JupiterSwapLayout.schema = new Map([
    [
        JupiterSwapLayout,
        {
            kind: 'struct',
            fields: [
                ['amm', [32]],
                ['inputMint', [32]],
                ['inputAmount', 'u64'],
                ['outputMint', [32]],
                ['outputAmount', 'u64'],
            ],
        },
    ],
]);
//# sourceMappingURL=jupiter-v6.layout.js.map