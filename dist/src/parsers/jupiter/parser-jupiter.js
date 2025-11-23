"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterParser = void 0;
const borsh_1 = require("borsh");
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
const jupiter_v6_layout_1 = require("./layouts/jupiter-v6.layout");
class JupiterParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (this.isJupiterRouteEventInstruction(instruction, programId)) {
                const event = this.parseJupiterRouteEventInstruction(instruction, `${outerIndex}-${innerIndex ?? 0}`);
                if (event) {
                    const data = this.processSwapData([event]);
                    if (data) {
                        trades.push(this.utils.attachTokenTransferInfo(data, this.transferActions));
                    }
                }
            }
        });
        return trades;
    }
    isJupiterRouteEventInstruction(instruction, programId) {
        if (programId !== constants_1.DEX_PROGRAMS.JUPITER.id)
            return false;
        const data = (0, utils_1.getInstructionData)(instruction);
        if (!data || data.length < 16)
            return false;
        return Buffer.from(data.slice(0, 16)).equals(Buffer.from(constants_1.DISCRIMINATORS.JUPITER.ROUTE_EVENT));
    }
    parseJupiterRouteEventInstruction(instruction, idx) {
        try {
            const data = (0, utils_1.getInstructionData)(instruction);
            if (!data || data.length < 16)
                return null;
            const eventData = data.slice(16);
            const layout = (0, borsh_1.deserializeUnchecked)(jupiter_v6_layout_1.JupiterSwapLayout.schema, jupiter_v6_layout_1.JupiterSwapLayout, Buffer.from(eventData));
            const swapEvent = layout.toSwapEvent();
            return {
                ...swapEvent,
                inputMintDecimals: this.adapter.getTokenDecimals(swapEvent.inputMint.toBase58()) || 0,
                outputMintDecimals: this.adapter.getTokenDecimals(swapEvent.outputMint.toBase58()) || 0,
                idx,
            };
        }
        catch (error) {
            console.error('Parse Jupiter route event error:', error);
            throw error;
        }
    }
    processSwapData(events) {
        if (events.length === 0)
            return null;
        const intermediateInfo = this.buildIntermediateInfo(events);
        return this.convertToTradeInfo(intermediateInfo);
    }
    buildIntermediateInfo(events) {
        const info = {
            amms: [],
            tokenIn: new Map(),
            tokenOut: new Map(),
            decimals: new Map(),
            idx: '',
        };
        for (const event of events) {
            const inputMint = event.inputMint.toBase58();
            const outputMint = event.outputMint.toBase58();
            info.tokenIn.set(inputMint, BigInt((info.tokenIn.get(inputMint) || BigInt(0)) + event.inputAmount));
            info.tokenOut.set(outputMint, BigInt((info.tokenOut.get(outputMint) || BigInt(0)) + event.outputAmount));
            info.decimals.set(inputMint, event.inputMintDecimals);
            info.decimals.set(outputMint, event.outputMintDecimals);
            info.idx = event.idx;
            info.amms.push((0, utils_1.getProgramName)(event.amm.toBase58()));
        }
        this.removeIntermediateTokens(info);
        return info;
    }
    removeIntermediateTokens(info) {
        for (const [mint, inAmount] of info.tokenIn.entries()) {
            const outAmount = info.tokenOut.get(mint);
            if (outAmount && inAmount === outAmount) {
                info.tokenIn.delete(mint);
                info.tokenOut.delete(mint);
            }
        }
    }
    convertToTradeInfo(info) {
        if (info.tokenIn.size !== 1 || info.tokenOut.size !== 1)
            return null;
        const [[inMint, inAmount]] = Array.from(info.tokenIn.entries());
        const [[outMint, outAmount]] = Array.from(info.tokenOut.entries());
        const inDecimals = info.decimals.get(inMint) || 0;
        const outDecimals = info.decimals.get(outMint) || 0;
        const signerIndex = this.containsDCAProgram() ? 2 : 0;
        const signer = this.adapter.getAccountKey(signerIndex);
        const trade = {
            type: (0, utils_1.getTradeType)(inMint, outMint),
            inputToken: {
                mint: inMint,
                amount: (0, types_1.convertToUiAmount)(inAmount, inDecimals),
                amountRaw: inAmount.toString(),
                decimals: inDecimals,
            },
            outputToken: {
                mint: outMint,
                amount: (0, types_1.convertToUiAmount)(outAmount, outDecimals),
                amountRaw: outAmount.toString(),
                decimals: outDecimals,
            },
            user: signer,
            programId: this.dexInfo.programId,
            amm: info.amms?.[0] || this.dexInfo.amm || '',
            route: this.dexInfo.route || '',
            slot: this.adapter.slot,
            timestamp: this.adapter.blockTime,
            signature: this.adapter.signature,
            idx: info.idx,
        };
        if (this.containsDCAProgram()) {
            // Jupiter DCA fee 0.1%
            const feeAmount = BigInt(outAmount) / 1000n;
            trade.fee = {
                mint: outMint,
                amount: (0, types_1.convertToUiAmount)(feeAmount, outDecimals),
                amountRaw: feeAmount.toString(),
                decimals: outDecimals,
            };
        }
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
    containsDCAProgram() {
        return this.adapter.accountKeys.some((key) => key === constants_1.DEX_PROGRAMS.JUPITER_DCA.id);
    }
}
exports.JupiterParser = JupiterParser;
//# sourceMappingURL=parser-jupiter.js.map