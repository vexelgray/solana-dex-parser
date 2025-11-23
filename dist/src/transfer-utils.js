"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processExtraAction = exports.isExtraAction = exports.processTransferCheck = exports.processNatvieTransfer = exports.processTransfer = exports.isNativeTransfer = exports.isTransfer = exports.isTransferCheck = void 0;
const constants_1 = require("./constants");
const types_1 = require("./types");
const utils_1 = require("./utils");
const isTransferCheck = (instruction) => {
    return ((instruction.programId == constants_1.TOKEN_PROGRAM_ID || instruction.programId == constants_1.TOKEN_2022_PROGRAM_ID) &&
        instruction.parsed.type.includes('transferChecked'));
};
exports.isTransferCheck = isTransferCheck;
const isTransfer = (instruction) => {
    return (instruction.program === 'spl-token' &&
        instruction.programId == constants_1.TOKEN_PROGRAM_ID &&
        instruction.parsed.type === 'transfer');
};
exports.isTransfer = isTransfer;
const isNativeTransfer = (instruction) => {
    return (instruction.program === 'system' && instruction.programId == constants_1.TOKENS.NATIVE && instruction.parsed.type === 'transfer');
};
exports.isNativeTransfer = isNativeTransfer;
const processTransfer = (instruction, idx, adapter) => {
    const { info } = instruction.parsed;
    if (!info)
        return null;
    const programId = (0, utils_1.getPubkeyString)(instruction.programId);
    const [token1, token2] = [
        adapter.splTokenMap.get(info.destination)?.mint,
        adapter.splTokenMap.get(info.source)?.mint,
    ];
    if (!token1 && !token2)
        return null;
    let mint = (0, utils_1.getTranferTokenMint)(token1, token2);
    if (!mint && programId == constants_1.TOKENS.NATIVE)
        mint = constants_1.TOKENS.SOL;
    if (!mint)
        return null;
    const decimals = adapter.splDecimalsMap.get(mint);
    if (typeof decimals === 'undefined')
        return null;
    const [sourceBalance, destinationBalance] = adapter.getTokenAccountBalance([info.source, info.destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getTokenAccountPreBalance([info.source, info.destination]);
    return {
        type: 'transfer',
        programId: programId,
        info: {
            authority: info.authority,
            destination: info.destination || '',
            destinationOwner: adapter.getTokenAccountOwner(info.destination),
            mint,
            source: info.source || '',
            tokenAmount: {
                amount: info.amount,
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(info.amount, decimals),
            },
            sourceBalance: sourceBalance,
            sourcePreBalance: sourcePreBalance,
            destinationBalance: destinationBalance,
            destinationPreBalance: destinationPreBalance,
        },
        idx: idx,
        timestamp: adapter.blockTime,
        signature: adapter.signature,
    };
};
exports.processTransfer = processTransfer;
const processNatvieTransfer = (instruction, idx, adapter) => {
    const { info } = instruction.parsed;
    if (!info)
        return null;
    const programId = (0, utils_1.getPubkeyString)(instruction.programId);
    const mint = constants_1.TOKENS.SOL;
    const decimals = constants_1.TOKEN_DECIMALS.SOL;
    const [sourceBalance, destinationBalance] = adapter.getAccountBalance([info.source, info.destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getAccountPreBalance([info.source, info.destination]);
    return {
        type: 'transfer',
        programId: programId,
        info: {
            authority: info.authority,
            destination: info.destination || '',
            destinationOwner: adapter.getTokenAccountOwner(info.destination),
            mint,
            source: info.source || '',
            tokenAmount: {
                amount: info.lamports,
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(info.lamports, decimals),
            },
            sourceBalance: sourceBalance,
            sourcePreBalance: sourcePreBalance,
            destinationBalance: destinationBalance,
            destinationPreBalance: destinationPreBalance,
        },
        idx: idx,
        timestamp: adapter.blockTime,
        signature: adapter.signature,
    };
};
exports.processNatvieTransfer = processNatvieTransfer;
const processTransferCheck = (instruction, idx, adapter) => {
    const { info } = instruction.parsed;
    if (!info)
        return null;
    const decimals = adapter.splDecimalsMap.get(info.mint);
    if (typeof decimals === 'undefined')
        return null;
    const [sourceBalance, destinationBalance] = adapter.getTokenAccountBalance([info.source, info.destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getTokenAccountPreBalance([info.source, info.destination]);
    return {
        type: 'transferChecked',
        programId: instruction.programId,
        info: {
            authority: info.authority,
            destination: info.destination || '',
            destinationOwner: adapter.getTokenAccountOwner(info.destination),
            mint: info.mint || '',
            source: info.source || '',
            tokenAmount: info.tokenAmount || {
                amount: info.amount,
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(info.amount, decimals),
            },
            sourceBalance: sourceBalance,
            sourcePreBalance: sourcePreBalance,
            destinationBalance: destinationBalance,
            destinationPreBalance: destinationPreBalance,
        },
        idx,
        timestamp: adapter.blockTime,
        signature: adapter.signature,
    };
};
exports.processTransferCheck = processTransferCheck;
const isExtraAction = (instruction, type) => {
    return (instruction.program === 'spl-token' && instruction.programId == constants_1.TOKEN_PROGRAM_ID && instruction.parsed.type === type);
};
exports.isExtraAction = isExtraAction;
const processExtraAction = (instruction, idx, adapter, type) => {
    const { info } = instruction.parsed;
    if (!info)
        return null;
    const mint = info.mint || adapter.splTokenMap.get(info.destination)?.mint;
    if (!mint)
        return null;
    const decimals = adapter.splDecimalsMap.get(mint);
    if (typeof decimals === 'undefined')
        return null;
    const [sourceBalance, destinationBalance] = adapter.getTokenAccountBalance([info.source, info.destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getTokenAccountPreBalance([info.source, info.destination]);
    return {
        type: type,
        programId: instruction.programId,
        info: {
            authority: info.authority || info.mintAuthority || '',
            destination: info.destination || '',
            destinationOwner: adapter.getTokenAccountOwner(info.destination),
            mint,
            source: info.source || '',
            tokenAmount: {
                amount: info.amount,
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(info.amount, decimals),
            },
            sourceBalance: sourceBalance,
            sourcePreBalance: sourcePreBalance,
            destinationBalance: destinationBalance,
            destinationPreBalance: destinationPreBalance,
        },
        idx: idx,
        timestamp: adapter.blockTime,
        signature: adapter.signature,
    };
};
exports.processExtraAction = processExtraAction;
//# sourceMappingURL=transfer-utils.js.map