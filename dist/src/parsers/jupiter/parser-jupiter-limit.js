"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterLimitOrderParser = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
class JupiterLimitOrderParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        return trades;
    }
    processTransfers() {
        const transfers = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (programId == constants_1.DEX_PROGRAMS.JUPITER_LIMIT_ORDER.id) {
                const data = (0, utils_1.getInstructionData)(instruction);
                if (Buffer.from(data.slice(0, 8)).equals(constants_1.DISCRIMINATORS.JUPITER_LIMIT_ORDER.CREATE_ORDER)) {
                    transfers.push(...this.parseInitializeOrder(instruction, programId, outerIndex, innerIndex));
                }
                else if (Buffer.from(data.slice(0, 8)).equals(constants_1.DISCRIMINATORS.JUPITER_LIMIT_ORDER.CANCEL_ORDER)) {
                    transfers.push(...this.parseCancelOrder(instruction, programId, outerIndex, innerIndex));
                }
            }
        });
        // Deduplicate transfers
        if (transfers.length > 1) {
            return [...new Map(transfers.map((item) => [`${item.idx}-${item.signature}=${item.isFee}`, item])).values()];
        }
        return transfers;
    }
    parseInitializeOrder(instruction, programId, outerIndex, innerIndex) {
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const [user, mint, source] = [accounts[1], accounts[5], accounts[4]];
        const destination = mint == constants_1.TOKENS.SOL ? user : accounts[3];
        const balance = mint == constants_1.TOKENS.SOL
            ? this.adapter.getAccountSolBalanceChanges(true).get(user)
            : this.adapter.getAccountTokenBalanceChanges().get(source)?.get(mint);
        const solBalance = this.adapter.getAccountSolBalanceChanges(true).get(user);
        if (!balance)
            return [];
        const transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex);
        const transfer = transfers.find((t) => t.info.mint == mint);
        const decimals = transfer?.info.tokenAmount.decimals || this.adapter.getTokenDecimals(mint);
        const tokenAmount = transfer?.info.tokenAmount.amount || balance.change.amount || '0';
        return [
            {
                type: 'initializeOrder',
                programId: programId,
                info: {
                    authority: this.adapter.getTokenAccountOwner(source) || user,
                    source: source,
                    destination: destination,
                    destinationOwner: this.adapter.getTokenAccountOwner(source),
                    mint: mint,
                    tokenAmount: {
                        amount: tokenAmount,
                        uiAmount: (0, types_1.convertToUiAmount)(tokenAmount, decimals),
                        decimals: decimals,
                    },
                    sourceBalance: balance.post,
                    sourcePreBalance: balance.pre,
                    solBalanceChange: solBalance?.change.amount || '0',
                },
                idx: `${outerIndex}-${innerIndex ?? 0}`,
                timestamp: this.adapter.blockTime,
                signature: this.adapter.signature,
            },
        ];
    }
    parseCancelOrder(instruction, programId, outerIndex, innerIndex) {
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(instruction);
        const [user, mint, source, authority] = [accounts[2], accounts[6], accounts[1], accounts[0]];
        const destination = mint == constants_1.TOKENS.SOL ? user : accounts[3];
        const balance = mint == constants_1.TOKENS.SOL
            ? this.adapter.getAccountSolBalanceChanges().get(destination)
            : this.adapter.getAccountTokenBalanceChanges().get(destination)?.get(mint);
        if (!balance)
            throw new Error('Balance not found');
        const transfers = this.getTransfersForInstruction(programId, outerIndex, innerIndex);
        const transfer = transfers.find((t) => t.info.mint == mint);
        const decimals = transfer?.info.tokenAmount.decimals || this.adapter.getTokenDecimals(mint);
        const tokenAmount = transfer?.info.tokenAmount.amount || balance.change.amount || '0';
        const tokens = [];
        tokens.push({
            type: 'cancelOrder',
            programId: programId,
            info: {
                authority: transfer?.info.authority || authority,
                source: transfer?.info.source || source,
                destination: transfer ? transfer?.info.destination || destination : user,
                destinationOwner: this.adapter.getTokenAccountOwner(destination),
                mint: mint,
                tokenAmount: {
                    amount: tokenAmount,
                    uiAmount: (0, types_1.convertToUiAmount)(tokenAmount, decimals),
                    decimals: decimals,
                },
                destinationBalance: balance.post,
                destinationPreBalance: balance.pre,
            },
            idx: `${outerIndex}-${innerIndex ?? 0}`,
            timestamp: this.adapter.blockTime,
            signature: this.adapter.signature,
        });
        if (mint !== constants_1.TOKENS.SOL) {
            const solBalance = this.adapter.getAccountSolBalanceChanges().get(user);
            if (solBalance) {
                tokens.push({
                    type: 'cancelOrder',
                    programId: programId,
                    info: {
                        authority: transfer?.info.authority || authority,
                        source: transfer?.info.source || source,
                        destination: user,
                        mint: constants_1.TOKENS.SOL,
                        tokenAmount: {
                            amount: solBalance.change.amount,
                            uiAmount: solBalance.change.uiAmount || 0,
                            decimals: solBalance.change.decimals,
                        },
                        destinationBalance: solBalance.post,
                        destinationPreBalance: solBalance.pre,
                    },
                    idx: `${outerIndex}-${innerIndex ?? 0}`,
                    timestamp: this.adapter.blockTime,
                    signature: this.adapter.signature,
                    isFee: true,
                });
            }
        }
        return tokens;
    }
}
exports.JupiterLimitOrderParser = JupiterLimitOrderParser;
//# sourceMappingURL=parser-jupiter-limit.js.map