"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEventParser = void 0;
class BaseEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
    }
    getTransfersForInstruction(programId, outerIndex, innerIndex) {
        const key = `${programId}:${outerIndex}${innerIndex == undefined ? '' : `-${innerIndex}`}`;
        const transfers = this.transferActions[key] || [];
        return transfers.filter((t) => ['transfer', 'transferChecked'].includes(t.type));
    }
}
exports.BaseEventParser = BaseEventParser;
//# sourceMappingURL=base-event-parser.js.map