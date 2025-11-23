"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraDAMMPoolParser = void 0;
const constants_1 = require("../../constants");
const parser_meteora_liquidity_base_1 = require("./parser-meteora-liquidity-base");
class MeteoraDAMMPoolParser extends parser_meteora_liquidity_base_1.MeteoraLiquidityParserBase {
    getPoolAction(data) {
        const instructionType = data.slice(0, 8);
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_POOL))
            return 'CREATE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_CUSTOM_POOL))
            return 'CREATE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_POOL_WITH_DYNAMIC_CONFIG))
            return 'CREATE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.ADD_LIQUIDITY))
            return 'ADD';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.CLAIM_POSITION_FEE))
            return 'REMOVE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.REMOVE_LIQUIDITY))
            return 'REMOVE';
        if (instructionType.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.REMOVE_ALL_LIQUIDITY))
            return 'REMOVE';
        return null;
    }
    parseCreateLiquidityEvent(instruction, index, data, transfers) {
        const discriminator = data.slice(0, 8);
        const eventInstruction = this.getInstructionByDiscriminator(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.CREATE_POSITION_EVENT, 16);
        if (!eventInstruction)
            throw new Error('Event instruction not found');
        const eventTransfers = this.getTransfersForInstruction(eventInstruction.programId, eventInstruction.outerIndex, eventInstruction.innerIndex);
        const [token0, token1] = this.utils.getLPTransfers(eventTransfers);
        const lpToken = transfers.find((t) => t.type === 'mintTo');
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const token0Mint = token0?.info.mint ||
            (discriminator.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_CUSTOM_POOL) ? accounts[7] : accounts[8]);
        const token1Mint = token1?.info.mint ||
            (discriminator.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_CUSTOM_POOL) ? accounts[8] : accounts[9]);
        const programId = this.adapter.getInstructionProgramId(instruction);
        const [token0Decimals, token1Decimals] = [
            this.adapter.getTokenDecimals(token0Mint),
            this.adapter.getTokenDecimals(token1Mint),
        ];
        let poolId = discriminator.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_CUSTOM_POOL) ? accounts[5] : accounts[6];
        if (discriminator.equals(constants_1.DISCRIMINATORS.METEORA_DAMM_V2.INITIALIZE_POOL_WITH_DYNAMIC_CONFIG)) {
            poolId = accounts[7];
        }
        return {
            ...this.adapter.getPoolEventBase('CREATE', programId),
            idx: index.toString(),
            poolId: poolId,
            poolLpMint: lpToken?.info.mint || accounts[1],
            token0Mint,
            token1Mint,
            token0Amount: token0?.info.tokenAmount.uiAmount,
            token0AmountRaw: token0?.info.tokenAmount.amount,
            token1Amount: token1?.info.tokenAmount.uiAmount,
            token1AmountRaw: token1?.info.tokenAmount.amount,
            token0Decimals,
            token1Decimals,
            lpAmount: lpToken?.info.tokenAmount.uiAmount || 1,
            lpAmountRaw: lpToken?.info.tokenAmount.amount || '1',
        };
    }
    parseAddLiquidityEvent(instruction, index, data, transfers) {
        const [token0, token1] = this.normalizeTokens(transfers);
        const programId = this.adapter.getInstructionProgramId(instruction);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return {
            ...this.adapter.getPoolEventBase('ADD', programId),
            idx: index.toString(),
            poolId: accounts[0],
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
            poolLpMint: accounts[2],
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
exports.MeteoraDAMMPoolParser = MeteoraDAMMPoolParser;
//# sourceMappingURL=liquidity-meteora-damm-v2.js.map