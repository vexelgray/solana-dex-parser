declare enum LogType {
    Init = 0,
    Deposit = 1,
    Withdraw = 2,
    SwapBaseIn = 3,
    SwapBaseOut = 4
}
declare const SWAP_DIRECTION: {
    readonly COIN_TO_PC: 0n;
    readonly PC_TO_COIN: 1n;
};
interface DepositLog {
    logType: LogType;
    maxCoin: bigint;
    maxPc: bigint;
    base: bigint;
    poolCoin: bigint;
    poolPc: bigint;
    poolLp: bigint;
    calcPnlX: bigint;
    calcPnlY: bigint;
    deductCoin: bigint;
    deductPc: bigint;
    mintLp: bigint;
}
interface WithdrawLog {
    logType: LogType;
    withdrawLp: bigint;
    userLp: bigint;
    poolCoin: bigint;
    poolPc: bigint;
    poolLp: bigint;
    calcPnlX: bigint;
    calcPnlY: bigint;
    outCoin: bigint;
    outPc: bigint;
}
interface SwapBaseInLog {
    logType: LogType;
    amountIn: bigint;
    minimumOut: bigint;
    direction: bigint;
    userSource: bigint;
    poolCoin: bigint;
    poolPc: bigint;
    outAmount: bigint;
}
interface SwapBaseOutLog {
    logType: LogType;
    maxIn: bigint;
    amountOut: bigint;
    direction: bigint;
    userSource: bigint;
    poolCoin: bigint;
    poolPc: bigint;
    deductIn: bigint;
}
declare function decodeRaydiumLog(base64Log: string): DepositLog | WithdrawLog | SwapBaseInLog | SwapBaseOutLog | null;
declare function parseRaydiumSwapLog(log: SwapBaseInLog | SwapBaseOutLog): {
    type: string;
    mode: string;
    inputAmount: bigint;
    outputAmount: bigint;
    slippageProtection: bigint;
};
export { LogType, SWAP_DIRECTION, decodeRaydiumLog, parseRaydiumSwapLog, type DepositLog, type WithdrawLog, type SwapBaseInLog, type SwapBaseOutLog, };
