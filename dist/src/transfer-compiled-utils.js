"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCompiledExtraAction = exports.isCompiledExtraAction = exports.processCompiledTransferCheck = exports.processCompiledNatvieTransfer = exports.processCompiledTransfer = exports.isCompiledTransferCheck = exports.isCompiledNativeTransfer = exports.isCompiledTransfer = void 0;
const constants_1 = require("./constants");
const types_1 = require("./types");
const utils_1 = require("./utils");
const isCompiledTransfer = (instruction) => {
    const data = (0, utils_1.getInstructionData)(instruction);
    return instruction.programId == constants_1.TOKEN_PROGRAM_ID && data[0] == constants_1.SPL_TOKEN_INSTRUCTION_TYPES.Transfer;
};
exports.isCompiledTransfer = isCompiledTransfer;
const isCompiledNativeTransfer = (instruction) => {
    const data = (0, utils_1.getInstructionData)(instruction);
    return instruction.programId == constants_1.TOKENS.NATIVE && data[0] == constants_1.SYSTEM_INSTRUCTION_TYPES.Transfer;
};
exports.isCompiledNativeTransfer = isCompiledNativeTransfer;
const isCompiledTransferCheck = (instruction) => {
    const data = (0, utils_1.getInstructionData)(instruction);
    return ((instruction.programId == constants_1.TOKEN_PROGRAM_ID || instruction.programId == constants_1.TOKEN_2022_PROGRAM_ID) &&
        data[0] == constants_1.SPL_TOKEN_INSTRUCTION_TYPES.TransferChecked);
};
exports.isCompiledTransferCheck = isCompiledTransferCheck;
const processCompiledTransfer = (instruction, idx, adapter) => {
    const accounts = instruction.accounts;
    const data = (0, utils_1.getInstructionData)(instruction);
    const amount = data.readBigUInt64LE(1);
    let authority;
    const [source, destination] = [accounts[0], accounts[1]]; // source, destination,amount, authority
    if (data[0] == constants_1.SPL_TOKEN_INSTRUCTION_TYPES.Transfer)
        authority = accounts[2];
    const [token1, token2] = [adapter.splTokenMap.get(destination)?.mint, adapter.splTokenMap.get(source)?.mint];
    if (!token1 && !token2)
        return null;
    let mint = (0, utils_1.getTranferTokenMint)(token1, token2);
    if (!mint && instruction.programId == constants_1.TOKENS.NATIVE)
        mint = constants_1.TOKENS.SOL;
    if (!mint)
        return null;
    const decimals = adapter.splDecimalsMap.get(mint);
    if (typeof decimals === 'undefined')
        return null;
    const [sourceBalance, destinationBalance] = adapter.getTokenAccountBalance([source, destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getTokenAccountPreBalance([source, destination]);
    return {
        type: 'transfer',
        programId: instruction.programId,
        info: {
            authority: authority,
            destination: destination || '',
            destinationOwner: adapter.getTokenAccountOwner(destination || ''),
            mint,
            source: source || '',
            tokenAmount: {
                amount: amount.toString(),
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(amount, decimals),
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
exports.processCompiledTransfer = processCompiledTransfer;
const processCompiledNatvieTransfer = (instruction, idx, adapter) => {
    const accounts = instruction.accounts;
    const data = (0, utils_1.getInstructionData)(instruction);
    const amount = data.readBigUInt64LE(4);
    const [source, destination] = [accounts[0], accounts[1]]; // source,amount,destination
    const decimals = 9;
    const [sourceBalance, destinationBalance] = adapter.getAccountBalance([source, destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getAccountPreBalance([source, destination]);
    return {
        type: 'transfer',
        programId: instruction.programId,
        info: {
            destination: destination || '',
            destinationOwner: adapter.getTokenAccountOwner(destination || ''),
            mint: constants_1.TOKENS.SOL,
            source: source || '',
            tokenAmount: {
                amount: amount.toString(),
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(amount, decimals),
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
exports.processCompiledNatvieTransfer = processCompiledNatvieTransfer;
const processCompiledTransferCheck = (instruction, idx, adapter) => {
    const accounts = instruction.accounts;
    if (!accounts)
        null;
    const [source, mint, destination, authority] = [accounts[0], accounts[1], accounts[2], accounts[3]]; // source, mint, destination, authority,amount,decimals
    const data = (0, utils_1.getInstructionData)(instruction);
    const amount = data.readBigUInt64LE(1);
    const decimals = adapter.splDecimalsMap.get(mint) || data.readUint8(9);
    const [sourceBalance, destinationBalance] = adapter.getTokenAccountBalance([source, destination]);
    const [sourcePreBalance, destinationPreBalance] = adapter.getTokenAccountPreBalance([source, destination]);
    return {
        type: 'transferChecked',
        programId: instruction.programId,
        info: {
            authority: authority,
            destination: destination || '',
            destinationOwner: adapter.getTokenAccountOwner(destination || ''),
            mint,
            source: source || '',
            tokenAmount: {
                amount: amount.toString(),
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(amount, decimals),
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
exports.processCompiledTransferCheck = processCompiledTransferCheck;
const isCompiledExtraAction = (instruction, type) => {
    if (instruction.programId != constants_1.TOKEN_PROGRAM_ID && instruction.programId != constants_1.TOKEN_2022_PROGRAM_ID)
        return false;
    const data = (0, utils_1.getInstructionData)(instruction);
    const instructionType = data[0];
    const typeMap = {
        mintTo: constants_1.SPL_TOKEN_INSTRUCTION_TYPES.MintTo,
        burn: constants_1.SPL_TOKEN_INSTRUCTION_TYPES.Burn,
        mintToChecked: constants_1.SPL_TOKEN_INSTRUCTION_TYPES.MintToChecked,
        burnChecked: constants_1.SPL_TOKEN_INSTRUCTION_TYPES.BurnChecked,
    };
    return typeMap[type] === instructionType;
};
exports.isCompiledExtraAction = isCompiledExtraAction;
const processCompiledExtraAction = (instruction, idx, adapter, type) => {
    const accounts = instruction.accounts;
    if (!accounts)
        return null;
    const data = (0, utils_1.getInstructionData)(instruction);
    let source, destination, authority, mint, decimals;
    const amount = data.readBigUInt64LE(1);
    switch (data[0]) {
        case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.MintTo:
            if (accounts.length < 2)
                return null;
            [mint, destination, authority] = [accounts[0], accounts[1], accounts[2]]; // mint, destination, authority, amount
            break;
        case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.MintToChecked:
            if (accounts.length < 3)
                return null;
            [mint, destination, authority] = [accounts[0], accounts[1], accounts[2]]; // mint, destination, authority, amount,decimals
            decimals = data.readUint8(9);
            break;
        case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.Burn:
            if (accounts.length < 2)
                return null;
            [source, mint, authority] = [accounts[0], accounts[1], accounts[2]]; // account, mint, authority, amount
            break;
        case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.BurnChecked:
            if (accounts.length < 3)
                return null;
            [source, mint, authority] = [accounts[0], accounts[1], accounts[2]]; // account, mint, authority, amount,decimals
            decimals = data.readUint8(9);
            break;
    }
    mint = mint || (destination && adapter.splTokenMap.get(destination)?.mint);
    if (!mint)
        return null;
    decimals = decimals || adapter.splDecimalsMap.get(mint);
    if (!decimals)
        return null;
    const [sourceBalance, destinationBalance] = adapter.getTokenAccountBalance([source || '', destination || '']);
    const [sourcePreBalance, destinationPreBalance] = adapter.getTokenAccountPreBalance([
        source || '',
        destination || '',
    ]);
    return {
        type: type,
        programId: instruction.programId,
        info: {
            authority: authority,
            destination: destination || '',
            destinationOwner: adapter.getTokenAccountOwner(destination || ''),
            mint,
            source: source || '',
            tokenAmount: {
                amount: amount.toString(),
                decimals,
                uiAmount: (0, types_1.convertToUiAmount)(amount, decimals),
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
exports.processCompiledExtraAction = processCompiledExtraAction;
//# sourceMappingURL=transfer-compiled-utils.js.map