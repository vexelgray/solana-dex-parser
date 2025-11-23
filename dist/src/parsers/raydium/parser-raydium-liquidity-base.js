"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumLiquidityParserBase = void 0;
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_liquidity_parser_1 = require("../base-liquidity-parser");
class RaydiumLiquidityParserBase extends base_liquidity_parser_1.BaseLiquidityParser {
    processLiquidity() {
        const events = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            const event = this.ParseRaydiumInstruction(instruction, programId, outerIndex, innerIndex);
            if (event) {
                events.push(event);
            }
        });
        return events;
    }
    ParseRaydiumInstruction(instruction, programId, outerIndex, innerIndex) {
        try {
            const data = (0, utils_1.getInstructionData)(instruction);
            const instructionType = this.getPoolAction(data);
            if (!instructionType)
                return null;
            const accounts = this.adapter.getInstructionAccounts(instruction);
            const type = typeof instructionType === 'string' ? instructionType : instructionType.type;
            const transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex).filter((it) => !it.info.destination || (it.info.authority && accounts.includes(it.info.destination)));
            const config = this.getEventConfig(type, instructionType);
            if (!config)
                return null;
            return this.parseEvent(instruction, outerIndex, data, transfers, config);
        }
        catch (error) {
            console.error('parseRaydiumInstruction error:', error);
            throw error;
        }
    }
    parseEvent(instruction, index, data, transfers, config) {
        if (config.eventType === 'ADD' && transfers.length < 2)
            return null;
        const [token0, token1] = this.utils.getLPTransfers(transfers);
        const lpToken = transfers.find((it) => it.type === (config.eventType === 'REMOVE' ? 'burn' : 'mintTo'));
        const programId = this.adapter.getInstructionProgramId(instruction);
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const token0Mint = token0?.info.mint;
        const token1Mint = token1?.info.mint;
        const [token0Decimals, token1Decimals] = [
            this.adapter.getTokenDecimals(token0Mint),
            this.adapter.getTokenDecimals(token1Mint),
        ];
        return {
            ...this.adapter.getPoolEventBase(config.eventType, programId),
            idx: index.toString(),
            poolId: accounts[config.poolIdIndex],
            poolLpMint: lpToken?.info.mint || accounts[config.lpMintIndex],
            token0Mint,
            token1Mint,
            token0Amount: token0?.info.tokenAmount.uiAmount ||
                (config.tokenAmountOffsets &&
                    (0, types_1.convertToUiAmount)(data.readBigUInt64LE(config.tokenAmountOffsets.token0), token0Decimals)),
            token0AmountRaw: token0?.info.tokenAmount.amount ||
                (config.tokenAmountOffsets && data.readBigUInt64LE(config.tokenAmountOffsets.token0).toString()),
            token1Amount: token1?.info.tokenAmount.uiAmount ||
                (config.tokenAmountOffsets &&
                    (0, types_1.convertToUiAmount)(data.readBigUInt64LE(config.tokenAmountOffsets.token1), token1Decimals)),
            token1AmountRaw: token1?.info.tokenAmount.amount ||
                (config.tokenAmountOffsets && data.readBigUInt64LE(config.tokenAmountOffsets.token1).toString()),
            token0Decimals,
            token1Decimals,
            lpAmount: lpToken?.info.tokenAmount.uiAmount,
            lpAmountRaw: lpToken?.info.tokenAmount.amount ||
                (config.tokenAmountOffsets && data.readBigUInt64LE(config.tokenAmountOffsets.lp).toString()) ||
                '0',
        };
    }
}
exports.RaydiumLiquidityParserBase = RaydiumLiquidityParserBase;
//# sourceMappingURL=parser-raydium-liquidity-base.js.map