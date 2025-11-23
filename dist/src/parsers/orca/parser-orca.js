"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrcaParser = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
class OrcaParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (constants_1.DEX_PROGRAMS.ORCA.id === programId && this.notLiquidityEvent(instruction)) {
                const transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex);
                if (transfers.length >= 2) {
                    const trade = this.utils.processSwapData(transfers, {
                        ...this.dexInfo,
                        amm: this.dexInfo.amm || (0, utils_1.getProgramName)(programId),
                    });
                    if (trade) {
                        trades.push(this.utils.attachTokenTransferInfo(trade, this.transferActions));
                    }
                }
            }
        });
        return trades;
    }
    notLiquidityEvent(instruction) {
        if (instruction.data) {
            const instructionType = (0, utils_1.getInstructionData)(instruction).slice(0, 8);
            return !Object.values(constants_1.DISCRIMINATORS.ORCA).some((it) => instructionType.equals(it));
        }
        return true;
    }
}
exports.OrcaParser = OrcaParser;
//# sourceMappingURL=parser-orca.js.map