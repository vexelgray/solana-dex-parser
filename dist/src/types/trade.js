"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToUiAmount = void 0;
/**
 * Converts raw token amount to human-readable format
 * @param amount Raw amount in bigint or string format
 * @param decimals Token decimals (defaults to 9)
 * @returns Human-readable amount as number
 */
const convertToUiAmount = (amount, decimals) => {
    if (decimals === 0)
        return Number(amount);
    return Number(amount) / Math.pow(10, decimals || 9);
};
exports.convertToUiAmount = convertToUiAmount;
//# sourceMappingURL=trade.js.map