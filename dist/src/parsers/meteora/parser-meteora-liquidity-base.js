"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraLiquidityParserBase = void 0;
const base_liquidity_parser_1 = require("../base-liquidity-parser");
const utils_1 = require("../../utils");
class MeteoraLiquidityParserBase extends base_liquidity_parser_1.BaseLiquidityParser {
    processLiquidity() {
        const events = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            const event = this.parseInstruction(instruction, programId, outerIndex, innerIndex);
            if (event) {
                events.push(event);
            }
        });
        return events;
    }
    parseInstruction(instruction, programId, outerIndex, innerIndex) {
        try {
            const data = (0, utils_1.getInstructionData)(instruction);
            const action = this.getPoolAction(data);
            if (!action)
                return null;
            let transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex);
            if (transfers.length === 0)
                transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex ?? 0);
            const type = typeof action === 'string' ? action : action.type;
            switch (type) {
                case 'CREATE':
                    return this.parseCreateLiquidityEvent?.(instruction, outerIndex, data, transfers) ?? null;
                case 'ADD':
                    return this.parseAddLiquidityEvent(instruction, outerIndex, data, transfers);
                case 'REMOVE':
                    return this.parseRemoveLiquidityEvent(instruction, outerIndex, data, transfers);
            }
        }
        catch (error) {
            console.error('parseInstruction error:', error);
            throw error;
        }
    }
}
exports.MeteoraLiquidityParserBase = MeteoraLiquidityParserBase;
//# sourceMappingURL=parser-meteora-liquidity-base.js.map