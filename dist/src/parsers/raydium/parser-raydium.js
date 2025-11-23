"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumParser = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
class RaydiumParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (this.notLiquidityEvent(instruction)) {
                const transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex);
                if (transfers.length >= 2) {
                    const trade = this.utils.processSwapData(transfers.slice(0, 2), {
                        ...this.dexInfo,
                        amm: this.dexInfo.amm || (0, utils_1.getProgramName)(programId),
                    });
                    if (trade) {
                        const pool = this.getPoolAddress(instruction, programId);
                        if (pool) {
                            trade.Pool = [pool];
                        }
                        if (transfers.length > 2) {
                            trade.fee = this.utils.getTransferTokenInfo(transfers[2]) ?? undefined;
                        }
                        trades.push(this.utils.attachTokenTransferInfo(trade, this.transferActions));
                    }
                }
            }
        });
        return trades;
    }
    getPoolAddress(instruction, programId) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        if (accounts.length > 5) {
            switch (programId) {
                case constants_1.DEX_PROGRAMS.RAYDIUM_V4.id:
                case constants_1.DEX_PROGRAMS.RAYDIUM_AMM.id:
                    return accounts[1];
                case constants_1.DEX_PROGRAMS.RAYDIUM_CL.id:
                    return accounts[2];
                case constants_1.DEX_PROGRAMS.RAYDIUM_CPMM.id:
                    return accounts[3];
                default:
                    return null;
            }
        }
        return null;
    }
    notLiquidityEvent(instruction) {
        if (instruction.data) {
            const data = (0, utils_1.getInstructionData)(instruction);
            const a = Object.values(constants_1.DISCRIMINATORS.RAYDIUM).some((it) => data.slice(0, 1).equals(it));
            const b = Object.values(constants_1.DISCRIMINATORS.RAYDIUM_CL)
                .flatMap((it) => Object.values(it))
                .some((it) => data.slice(0, 8).equals(it));
            const c = Object.values(constants_1.DISCRIMINATORS.RAYDIUM_CPMM).some((it) => data.slice(0, 8).equals(it));
            return !a && !b && !c;
        }
        return true;
    }
}
exports.RaydiumParser = RaydiumParser;
//# sourceMappingURL=parser-raydium.js.map