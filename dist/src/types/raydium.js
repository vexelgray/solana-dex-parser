"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurveType = exports.PoolStatus = exports.TradeDirection = void 0;
var TradeDirection;
(function (TradeDirection) {
    TradeDirection[TradeDirection["Buy"] = 0] = "Buy";
    TradeDirection[TradeDirection["Sell"] = 1] = "Sell";
})(TradeDirection || (exports.TradeDirection = TradeDirection = {}));
var PoolStatus;
(function (PoolStatus) {
    PoolStatus[PoolStatus["Fund"] = 0] = "Fund";
    PoolStatus[PoolStatus["Migrate"] = 1] = "Migrate";
    PoolStatus[PoolStatus["Trade"] = 2] = "Trade";
})(PoolStatus || (exports.PoolStatus = PoolStatus = {}));
var CurveType;
(function (CurveType) {
    CurveType[CurveType["Constant"] = 0] = "Constant";
    CurveType[CurveType["Fixed"] = 1] = "Fixed";
    CurveType[CurveType["Linear"] = 2] = "Linear";
})(CurveType || (exports.CurveType = CurveType = {}));
//# sourceMappingURL=raydium.js.map