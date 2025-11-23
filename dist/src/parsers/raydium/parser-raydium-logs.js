"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWAP_DIRECTION = exports.LogType = void 0;
exports.decodeRaydiumLog = decodeRaydiumLog;
exports.parseRaydiumSwapLog = parseRaydiumSwapLog;
// Define log types for different operations
var LogType;
(function (LogType) {
    LogType[LogType["Init"] = 0] = "Init";
    LogType[LogType["Deposit"] = 1] = "Deposit";
    LogType[LogType["Withdraw"] = 2] = "Withdraw";
    LogType[LogType["SwapBaseIn"] = 3] = "SwapBaseIn";
    LogType[LogType["SwapBaseOut"] = 4] = "SwapBaseOut";
})(LogType || (exports.LogType = LogType = {}));
// Constants for swap direction
const SWAP_DIRECTION = {
    COIN_TO_PC: 0n, // Token A -> Token B (e.g., SOL -> USDC)
    PC_TO_COIN: 1n, // Token B -> Token A (e.g., USDC -> SOL)
};
exports.SWAP_DIRECTION = SWAP_DIRECTION;
// Main function to decode Raydium logs
function decodeRaydiumLog(base64Log) {
    // Remove "ray_log:" prefix and clean the string
    const cleanLog = base64Log.replace('ray_log:', '').trim();
    // Decode base64 string to buffer
    const data = Buffer.from(cleanLog, 'base64');
    // Read log type from first byte
    const logType = data[0];
    let offset = 1;
    // Helper function to read uint64 values
    function readU64() {
        const value = data.readBigUInt64LE(offset);
        offset += 8;
        return value;
    }
    // Helper function to read uint128 values
    function readU128() {
        const value = data.readBigUInt64LE(offset);
        const valueHigh = data.readBigUInt64LE(offset + 8);
        offset += 16;
        return valueHigh * BigInt(2 ** 64) + value;
    }
    // Parse log based on its type
    switch (logType) {
        case LogType.Deposit:
            return {
                logType: LogType.Deposit,
                maxCoin: readU64(),
                maxPc: readU64(),
                base: readU64(),
                poolCoin: readU64(),
                poolPc: readU64(),
                poolLp: readU64(),
                calcPnlX: readU128(),
                calcPnlY: readU128(),
                deductCoin: readU64(),
                deductPc: readU64(),
                mintLp: readU64(),
            };
        case LogType.Withdraw:
            return {
                logType: LogType.Withdraw,
                withdrawLp: readU64(),
                userLp: readU64(),
                poolCoin: readU64(),
                poolPc: readU64(),
                poolLp: readU64(),
                calcPnlX: readU128(),
                calcPnlY: readU128(),
                outCoin: readU64(),
                outPc: readU64(),
            };
        case LogType.SwapBaseIn:
            return {
                logType: LogType.SwapBaseIn,
                amountIn: readU64(),
                minimumOut: readU64(),
                direction: readU64(),
                userSource: readU64(),
                poolCoin: readU64(),
                poolPc: readU64(),
                outAmount: readU64(),
            };
        case LogType.SwapBaseOut:
            return {
                logType: LogType.SwapBaseOut,
                maxIn: readU64(),
                amountOut: readU64(),
                direction: readU64(),
                userSource: readU64(),
                poolCoin: readU64(),
                poolPc: readU64(),
                deductIn: readU64(),
            };
        default:
            return null; //Unsupported log type
    }
}
// Helper function to parse swap operation details
function parseRaydiumSwapLog(log) {
    const isBaseIn = 'amountIn' in log;
    const isBuy = log.direction === SWAP_DIRECTION.PC_TO_COIN;
    const operation = {
        type: isBuy ? 'Buy' : 'Sell',
        mode: isBaseIn ? 'Exact Input' : 'Exact Output',
        inputAmount: isBaseIn ? log.amountIn : log.deductIn,
        outputAmount: isBaseIn ? log.outAmount : log.amountOut,
        slippageProtection: isBaseIn ? log.minimumOut : log.maxIn,
    };
    return operation;
}
//# sourceMappingURL=parser-raydium-logs.js.map