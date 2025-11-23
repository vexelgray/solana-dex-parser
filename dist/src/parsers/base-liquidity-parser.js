"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLiquidityParser = void 0;
const transaction_utils_1 = require("../transaction-utils");
const utils_1 = require("../utils");
class BaseLiquidityParser {
    constructor(adapter, transferActions, classifiedInstructions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.classifiedInstructions = classifiedInstructions;
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    getTransfersForInstruction(programId, outerIndex, innerIndex, filterTypes) {
        const key = `${programId}:${outerIndex}${innerIndex == undefined ? '' : `-${innerIndex}`}`;
        const transfers = this.transferActions[key] || [];
        if (filterTypes) {
            return transfers.filter((t) => filterTypes.includes(t.type));
        }
        return transfers;
    }
    getInstructionByDiscriminator(discriminator, slice) {
        const instruction = this.classifiedInstructions.find((i) => {
            const data = (0, utils_1.getInstructionData)(i.instruction);
            return data.slice(0, slice).equals(discriminator);
        });
        return instruction;
    }
}
exports.BaseLiquidityParser = BaseLiquidityParser;
//# sourceMappingURL=base-liquidity-parser.js.map