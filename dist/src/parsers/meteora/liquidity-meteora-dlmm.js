"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraDLMMPoolParser = void 0;
const constants_1 = require("../../constants");
const parser_meteora_liquidity_base_1 = require("./parser-meteora-liquidity-base");
class MeteoraDLMMPoolParser extends parser_meteora_liquidity_base_1.MeteoraLiquidityParserBase {
    getPoolAction(data) {
        const instructionType = data.slice(0, 8);
        for (const [name, discriminator] of Object.entries(constants_1.DISCRIMINATORS.METEORA_DLMM.ADD_LIQUIDITY)) {
            if (instructionType.equals(discriminator)) {
                return { name, type: 'ADD' };
            }
        }
        for (const [name, discriminator] of Object.entries(constants_1.DISCRIMINATORS.METEORA_DLMM.REMOVE_LIQUIDITY)) {
            if (instructionType.equals(discriminator)) {
                return { name, type: 'REMOVE' };
            }
        }
        return null;
    }
    parseAddLiquidityEvent(instruction, index, data, transfers) {
        const [token0, token1] = this.normalizeTokens(transfers);
        const programId = this.adapter.getInstructionProgramId(instruction);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            ...this.adapter.getPoolEventBase('ADD', programId),
            idx: index.toString(),
            poolId: accounts[1],
            poolLpMint: accounts[1],
            token0Mint: token0?.info.mint,
            token1Mint: token1?.info.mint,
            token0Amount: token0?.info.tokenAmount.uiAmount || 0,
            token0AmountRaw: token0?.info.tokenAmount.amount,
            token1Amount: token1?.info.tokenAmount.uiAmount || 0,
            token1AmountRaw: token1?.info.tokenAmount.amount,
            token0Decimals: token0 && this.adapter.getTokenDecimals(token0?.info.mint),
            token1Decimals: token1 && this.adapter.getTokenDecimals(token1?.info.mint),
        };
    }
    parseRemoveLiquidityEvent(instruction, index, data, transfers) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        let [token0, token1] = this.normalizeTokens(transfers);
        if (token1 == undefined && token0?.info.mint == accounts[8]) {
            token1 = token0;
            token0 = undefined;
        }
        else if (token0 == undefined && token1?.info.mint == accounts[7]) {
            token0 = token1;
            token1 = undefined;
        }
        const token0Mint = token0?.info.mint || accounts[7];
        const token1Mint = token1?.info.mint || accounts[8];
        const programId = this.adapter.getInstructionProgramId(instruction);
        return {
            ...this.adapter.getPoolEventBase('REMOVE', programId),
            idx: index.toString(),
            poolId: accounts[1],
            poolLpMint: accounts[1],
            token0Mint: token0?.info.mint || accounts[7],
            token1Mint: token1?.info.mint || accounts[8],
            token0Amount: token0?.info.tokenAmount.uiAmount || 0,
            token0AmountRaw: token0?.info.tokenAmount.amount,
            token1Amount: token1?.info.tokenAmount.uiAmount || 0,
            token1AmountRaw: token1?.info.tokenAmount.amount,
            token0Decimals: this.adapter.getTokenDecimals(token0Mint),
            token1Decimals: this.adapter.getTokenDecimals(token1Mint),
        };
    }
    normalizeTokens(transfers) {
        let [token0, token1] = this.utils.getLPTransfers(transfers);
        if (transfers.length === 1 && transfers[0].info.mint == constants_1.TOKENS.SOL) {
            token1 = transfers[0];
            token0 = null;
        }
        return [token0, token1];
    }
}
exports.MeteoraDLMMPoolParser = MeteoraDLMMPoolParser;
//# sourceMappingURL=liquidity-meteora-dlmm.js.map