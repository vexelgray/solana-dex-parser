"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonitParser = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
// MoonShot
class MoonitParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (this.isTradeInstruction(instruction, programId)) {
                const trade = this.parseTradeInstruction(instruction, `${outerIndex}-${innerIndex ?? 0}`);
                if (trade) {
                    trades.push(trade);
                }
            }
        });
        return trades;
    }
    isTradeInstruction(instruction, programId) {
        const accounts = this.adapter.getInstructionAccounts(instruction);
        return programId === constants_1.DEX_PROGRAMS.MOONIT.id && accounts && accounts.length === 11;
    }
    parseTradeInstruction(instruction, idx) {
        try {
            if (!('data' in instruction))
                return null;
            const data = (0, utils_1.getInstructionData)(instruction);
            const discriminator = data.slice(0, 8);
            let tradeType;
            if (discriminator.equals(constants_1.DISCRIMINATORS.MOONIT.BUY)) {
                tradeType = 'BUY';
            }
            else if (discriminator.equals(constants_1.DISCRIMINATORS.MOONIT.SELL)) {
                tradeType = 'SELL';
            }
            else {
                return null;
            }
            const moonitTokenMint = this.adapter.getInstructionAccounts(instruction)[6];
            const accountKeys = this.adapter.accountKeys;
            const collateralMint = this.detectCollateralMint(accountKeys);
            const { tokenAmount, collateralAmount } = this.calculateAmounts(moonitTokenMint, collateralMint);
            const trade = {
                type: tradeType,
                Pool: [accountKeys[2]],
                inputToken: {
                    mint: tradeType === 'BUY' ? collateralMint : moonitTokenMint,
                    amount: tradeType === 'BUY' ? (collateralAmount.uiAmount ?? 0) : (tokenAmount.uiAmount ?? 0),
                    amountRaw: tradeType === 'BUY' ? collateralAmount.amount : tokenAmount.amount,
                    decimals: tradeType === 'BUY' ? collateralAmount.decimals : tokenAmount.decimals,
                },
                outputToken: {
                    mint: tradeType === 'BUY' ? moonitTokenMint : collateralMint,
                    amount: tradeType === 'BUY' ? (tokenAmount.uiAmount ?? 0) : (collateralAmount.uiAmount ?? 0),
                    amountRaw: tradeType === 'BUY' ? tokenAmount.amount : collateralAmount.amount,
                    decimals: tradeType === 'BUY' ? tokenAmount.decimals : collateralAmount.decimals,
                },
                user: this.adapter.signer,
                programId: constants_1.DEX_PROGRAMS.MOONIT.id,
                amm: constants_1.DEX_PROGRAMS.MOONIT.name,
                route: this.dexInfo.route || '',
                slot: this.adapter.slot,
                timestamp: this.adapter.blockTime,
                signature: this.adapter.signature,
                idx,
            };
            return this.utils.attachTokenTransferInfo(trade, this.transferActions);
        }
        catch (error) {
            console.error('Failed to parse Moonit trade:', error);
            throw error;
        }
    }
    detectCollateralMint(accountKeys) {
        if (accountKeys.some((key) => key === constants_1.TOKENS.USDC))
            return constants_1.TOKENS.USDC;
        if (accountKeys.some((key) => key === constants_1.TOKENS.USDT))
            return constants_1.TOKENS.USDT;
        return constants_1.TOKENS.SOL;
    }
    calculateAmounts(tokenMint, collateralMint) {
        const tokenBalanceChanges = this.getTokenBalanceChanges(tokenMint);
        const collateralBalanceChanges = this.getTokenBalanceChanges(collateralMint);
        return {
            tokenAmount: this.createTokenAmount((0, utils_1.absBigInt)(tokenBalanceChanges), tokenMint),
            collateralAmount: this.createTokenAmount((0, utils_1.absBigInt)(collateralBalanceChanges), collateralMint),
        };
    }
    getTokenBalanceChanges(mint) {
        const signer = this.adapter.signer;
        if (mint === constants_1.TOKENS.SOL) {
            if (!this.adapter.postBalances?.[0] || !this.adapter.preBalances?.[0]) {
                throw new Error('Insufficient balance information for SOL');
            }
            return BigInt(this.adapter.postBalances[0] - this.adapter.preBalances[0]);
        }
        let preAmount = BigInt(0);
        let postAmount = BigInt(0);
        let balanceFound = false;
        this.adapter.preTokenBalances?.forEach((preBalance) => {
            if (preBalance.mint === mint && preBalance.owner === signer) {
                preAmount = BigInt(preBalance.uiTokenAmount.amount);
                balanceFound = true;
            }
        });
        this.adapter.postTokenBalances?.forEach((postBalance) => {
            if (postBalance.mint === mint && postBalance.owner === signer) {
                postAmount = BigInt(postBalance.uiTokenAmount.amount);
                balanceFound = true;
            }
        });
        if (!balanceFound) {
            throw new Error('Could not find balance for specified mint and signer');
        }
        return postAmount - preAmount;
    }
    createTokenAmount(amount, mint) {
        const decimals = this.adapter.getTokenDecimals(mint);
        return {
            amount: amount.toString(),
            uiAmount: (0, types_1.convertToUiAmount)(amount, decimals),
            decimals,
        };
    }
}
exports.MoonitParser = MoonitParser;
//# sourceMappingURL=parser-moonit.js.map