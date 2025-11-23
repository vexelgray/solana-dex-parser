"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraParser = void 0;
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
class MeteoraParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if ([constants_1.DEX_PROGRAMS.METEORA.id, constants_1.DEX_PROGRAMS.METEORA_DAMM.id, constants_1.DEX_PROGRAMS.METEORA_DAMM_V2.id].includes(programId) &&
                this.notLiquidityEvent(instruction)) {
                let transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex);
                if (transfers.length >= 2) {
                    if (programId == constants_1.DEX_PROGRAMS.METEORA.id) {
                        transfers = transfers.slice(0, 2);
                    }
                    const trade = this.utils.processSwapData(transfers, {
                        ...this.dexInfo,
                        amm: this.dexInfo.amm || (0, utils_1.getProgramName)(programId),
                    });
                    if (trade) {
                        const pool = this.getPoolAddress(instruction, programId);
                        if (pool) {
                            trade.Pool = [pool];
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
                case constants_1.DEX_PROGRAMS.METEORA_DAMM.id:
                case constants_1.DEX_PROGRAMS.METEORA.id:
                    return accounts[0];
                case constants_1.DEX_PROGRAMS.METEORA_DAMM_V2.id:
                    return accounts[1];
                default:
                    return null;
            }
        }
        return null;
    }
    notLiquidityEvent(instruction) {
        const data = (0, utils_1.getInstructionData)(instruction);
        if (!data)
            return true;
        const isDLMMLiquidity = Object.values(constants_1.DISCRIMINATORS.METEORA_DLMM)
            .flatMap((it) => Object.values(it))
            .some((it) => data.slice(0, it.length).equals(it));
        const isPoolsLiquidity = Object.values(constants_1.DISCRIMINATORS.METEORA_DAMM).some((it) => data.slice(0, it.length).equals(it));
        const isDAMMLiquidity = Object.values(constants_1.DISCRIMINATORS.METEORA_DAMM_V2).some((it) => data.slice(0, it.length).equals(it));
        return !isDLMMLiquidity && !isPoolsLiquidity && !isDAMMLiquidity;
    }
}
exports.MeteoraParser = MeteoraParser;
//# sourceMappingURL=parser-meteora.js.map