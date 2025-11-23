"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraPoolsParser = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const parser_meteora_liquidity_base_1 = require("./parser-meteora-liquidity-base");
class MeteoraPoolsParser extends parser_meteora_liquidity_base_1.MeteoraLiquidityParserBase {
    getPoolAction(data) {
        const instructionType = data.slice(0, 8);
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM.CREATE))
            return 'CREATE';
        if ([constants_1.DISCRIMINATORS.METEORA_DAMM.ADD_LIQUIDITY, constants_1.DISCRIMINATORS.METEORA_DAMM.ADD_IMBALANCE_LIQUIDITY].some((it) => instructionType.equals(it)))
            return 'ADD';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM.REMOVE_LIQUIDITY))
            return 'REMOVE';
        return null;
    }
    parseCreateLiquidityEvent(instruction, index, data, transfers) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const [token0, token1] = this.utils.getLPTransfers(transfers);
        const lpToken = transfers.find((t) => t.type === 'mintTo');
        const token0Mint = token0?.info.mint || accounts[3];
        const token1Mint = token1?.info.mint || accounts[4];
        const programId = this.adapter.getInstructionProgramId(instruction);
        const [token0Decimals, token1Decimals] = [
            this.adapter.getTokenDecimals(token0Mint),
            this.adapter.getTokenDecimals(token1Mint),
        ];
        return {
            ...this.adapter.getPoolEventBase('CREATE', programId),
            idx: index.toString(),
            poolId: accounts[0],
            poolLpMint: accounts[2],
            token0Mint,
            token1Mint,
            token0Amount: token0?.info.tokenAmount.uiAmount || (0, types_1.convertToUiAmount)(data.readBigUInt64LE(16), token0Decimals),
            token0AmountRaw: token0?.info.tokenAmount.amount || data.readBigUInt64LE(16).toString(),
            token1Amount: token1?.info.tokenAmount.uiAmount || (0, types_1.convertToUiAmount)(data.readBigUInt64LE(8), token1Decimals),
            token1AmountRaw: token1?.info.tokenAmount.amount || data.readBigUInt64LE(8).toString(),
            token0Decimals,
            token1Decimals,
            lpAmount: lpToken?.info.tokenAmount.uiAmount || 0,
            lpAmountRaw: lpToken?.info.tokenAmount.amount,
        };
    }
    parseAddLiquidityEvent(instruction, index, data, transfers) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const [token0, token1] = this.utils.getLPTransfers(transfers);
        const lpToken = transfers.find((t) => t.type === 'mintTo');
        const token0Mint = token0?.info.mint;
        const token1Mint = token1?.info.mint;
        const programId = this.adapter.getInstructionProgramId(instruction);
        const [token0Decimals, token1Decimals] = [
            this.adapter.getTokenDecimals(token0Mint),
            this.adapter.getTokenDecimals(token1Mint),
        ];
        return {
            ...this.adapter.getPoolEventBase('ADD', programId),
            idx: index.toString(),
            poolId: accounts[0],
            poolLpMint: accounts[1],
            token0Mint,
            token1Mint,
            token0Amount: token0?.info.tokenAmount.uiAmount || (0, types_1.convertToUiAmount)(data.readBigUInt64LE(24), token0Decimals),
            token0AmountRaw: token0?.info.tokenAmount.amount || data.readBigUInt64LE(24).toString(),
            token1Amount: token1?.info.tokenAmount.uiAmount || (0, types_1.convertToUiAmount)(data.readBigUInt64LE(16), token1Decimals),
            token1AmountRaw: token1?.info.tokenAmount.amount || data.readBigUInt64LE(16).toString(),
            token0Decimals,
            token1Decimals,
            lpAmount: lpToken?.info.tokenAmount.uiAmount ||
                (0, types_1.convertToUiAmount)(data.readBigUInt64LE(8), this.adapter.getTokenDecimals(accounts[1])),
            lpAmountRaw: lpToken?.info.tokenAmount.amount || data.readBigUInt64LE(8).toString(),
        };
    }
    parseRemoveLiquidityEvent(instruction, index, data, transfers) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const [token0, token1] = this.utils.getLPTransfers(transfers);
        const lpToken = transfers.find((t) => t.type === 'burn');
        const token0Mint = token0?.info.mint;
        const token1Mint = token1?.info.mint;
        const programId = this.adapter.getInstructionProgramId(instruction);
        const [token0Decimals, token1Decimals] = [
            this.adapter.getTokenDecimals(token0Mint),
            this.adapter.getTokenDecimals(token1Mint),
        ];
        return {
            ...this.adapter.getPoolEventBase('REMOVE', programId),
            idx: index.toString(),
            poolId: accounts[0],
            poolLpMint: accounts[1],
            token0Mint,
            token1Mint,
            token0Amount: token0?.info.tokenAmount.uiAmount || (0, types_1.convertToUiAmount)(data.readBigUInt64LE(24), token0Decimals),
            token0AmountRaw: token0?.info.tokenAmount.amount || data.readBigUInt64LE(24).toString(),
            token1Amount: token1?.info.tokenAmount.uiAmount || (0, types_1.convertToUiAmount)(data.readBigUInt64LE(16), token1Decimals),
            token1AmountRaw: token1?.info.tokenAmount.amount || data.readBigUInt64LE(16).toString(),
            token0Decimals,
            token1Decimals,
            lpAmount: lpToken?.info.tokenAmount.uiAmount ||
                (0, types_1.convertToUiAmount)(data.readBigUInt64LE(8), this.adapter.getTokenDecimals(accounts[1])),
            lpAmountRaw: lpToken?.info.tokenAmount.amount || data.readBigUInt64LE(8).toString(),
        };
    }
}
exports.MeteoraPoolsParser = MeteoraPoolsParser;
//# sourceMappingURL=liquidity-meteora-pools.js.map