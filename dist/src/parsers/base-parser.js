"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
const transaction_utils_1 = require("../transaction-utils");
class BaseParser {
    constructor(adapter, dexInfo, transferActions, classifiedInstructions) {
        this.adapter = adapter;
        this.dexInfo = dexInfo;
        this.transferActions = transferActions;
        this.classifiedInstructions = classifiedInstructions;
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    getTransfersForInstruction(programId, outerIndex, innerIndex, extraTypes) {
        const key = `${programId}:${outerIndex}${innerIndex == undefined ? '' : `-${innerIndex}`}`;
        const transfers = this.transferActions[key] || [];
        return transfers.filter((t) => ['transfer', 'transferChecked', ...(extraTypes || [])].includes(t.type));
    }
}
exports.BaseParser = BaseParser;
//# sourceMappingURL=base-parser.js.map