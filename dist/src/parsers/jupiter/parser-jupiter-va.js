"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterVAParser = void 0;
const borsh_1 = require("borsh");
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
const jupiter_va_layout_1 = require("./layouts/jupiter-va.layout");
class JupiterVAParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (programId == constants_1.DEX_PROGRAMS.JUPITER_VA.id) {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = Buffer.from(data.slice(0, 16));
                if (discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_VA.FILL_EVENT)) {
                    trades.push(this.parseFullFilled(instruction, `${outerIndex}-${innerIndex ?? 0}`));
                }
            }
        });
        return trades;
    }
    parseFullFilled(instruction, idx) {
        const eventData = (0, utils_1.getInstructionData)(instruction).slice(16);
        const layout = (0, borsh_1.deserializeUnchecked)(jupiter_va_layout_1.JupiterVAFillLayout.schema, jupiter_va_layout_1.JupiterVAFillLayout, Buffer.from(eventData));
        const event = layout.toObject();
        const tradeType = (0, utils_1.getTradeType)(event.inputMint, event.outputMint);
        const [inputDecimal, outputDecimal] = [
            this.adapter.splDecimalsMap.get(event.inputMint),
            this.adapter.splDecimalsMap.get(event.outputMint),
        ];
        const trade = {
            type: tradeType,
            Pool: [],
            inputToken: {
                mint: event.inputMint,
                amount: (0, types_1.convertToUiAmount)(event.inputAmount, inputDecimal),
                amountRaw: event.inputAmount.toString(),
                decimals: inputDecimal ?? 0,
            },
            outputToken: {
                mint: event.outputMint,
                amount: (0, types_1.convertToUiAmount)(event.outputAmount, outputDecimal),
                amountRaw: event.outputAmount.toString(),
                decimals: outputDecimal ?? 0,
            },
            fee: {
                mint: event.outputMint,
                amount: (0, types_1.convertToUiAmount)(event.fee, outputDecimal),
                amountRaw: event.fee.toString(),
                decimals: outputDecimal ?? 0,
            },
            user: event.user,
            programId: constants_1.DEX_PROGRAMS.JUPITER_VA.id,
            amm: this.getAmm(),
            route: this.dexInfo?.route || '',
            slot: this.adapter.slot,
            timestamp: this.adapter.blockTime || 0,
            signature: this.adapter.signature,
            idx: idx || '',
        };
        return this.utils.attachTokenTransferInfo(trade, this.transferActions);
    }
    getAmm() {
        const amms = (0, utils_1.getAMMs)(Object.keys(this.transferActions));
        return amms.length > 0 ? amms[0] : this.dexInfo?.amm || constants_1.DEX_PROGRAMS.JUPITER_VA.name;
    }
    processTransfers() {
        const transfers = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (programId == constants_1.DEX_PROGRAMS.JUPITER_VA.id) {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = Buffer.from(data.slice(0, 16));
                if (discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_VA.OPEN_EVENT)) {
                    transfers.push(...this.parseOpen(data, programId, outerIndex, `${outerIndex}-${innerIndex ?? 0}`));
                }
                else if (discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_VA.WITHDRAW_EVENT)) {
                    transfers.push(...this.parseWithdraw(data, programId, outerIndex, `${outerIndex}-${innerIndex ?? 0}`));
                }
            }
        });
        return transfers;
    }
    parseOpen(data, programId, outerIndex, idx) {
        // find outer instruction
        const eventInstruction = this.adapter.instructions[outerIndex];
        if (!eventInstruction) {
            throw new Error('Event instruction not found');
        }
        // parse event data
        const eventData = data.slice(16);
        const event = jupiter_va_layout_1.JupiterVAOpenLayout.deserialize(eventData).toObject();
        // get outer instruction accounts
        const accounts = this.adapter.getInstructionAccounts(eventInstruction);
        const user = event.user;
        const [source, destination] = [accounts[5], accounts[6]];
        const balance = event.inputMint == constants_1.TOKENS.SOL
            ? this.adapter.getAccountSolBalanceChanges().get(user)
            : this.adapter.getAccountTokenBalanceChanges().get(user)?.get(event.inputMint);
        if (!balance)
            return [];
        return [
            {
                type: 'open',
                programId: programId,
                info: {
                    authority: user,
                    source: source,
                    destination: destination,
                    destinationOwner: this.adapter.getTokenAccountOwner(destination),
                    mint: event.inputMint,
                    tokenAmount: {
                        amount: balance.change.amount,
                        uiAmount: balance.change.uiAmount ?? 0,
                        decimals: balance.change.decimals,
                    },
                    sourceBalance: balance.post,
                    sourcePreBalance: balance.pre,
                },
                idx: idx,
                timestamp: this.adapter.blockTime,
                signature: this.adapter.signature,
            },
        ];
    }
    parseWithdraw(data, programId, outerIndex, idx) {
        // find outer instruction
        const eventInstruction = this.adapter.instructions[outerIndex];
        if (!eventInstruction) {
            throw new Error('Event instruction not found');
        }
        // parse event data
        const eventData = data.slice(16);
        const event = jupiter_va_layout_1.JupiterVAWithdrawLayout.deserialize(eventData).toObject();
        // get outer instruction accounts
        const accounts = this.adapter.getInstructionAccounts(eventInstruction);
        const user = accounts[1];
        const source = accounts[8];
        const balance = event.mint == constants_1.TOKENS.SOL
            ? this.adapter.getAccountSolBalanceChanges().get(user)
            : this.adapter.getAccountTokenBalanceChanges().get(user)?.get(event.mint);
        if (!balance)
            return [];
        return [
            {
                type: 'withdraw',
                programId: programId,
                info: {
                    authority: this.adapter.getTokenAccountOwner(source),
                    source: source,
                    destination: user,
                    destinationOwner: this.adapter.getTokenAccountOwner(user),
                    mint: event.mint,
                    tokenAmount: {
                        amount: balance.change.amount,
                        uiAmount: balance.change.uiAmount ?? 0,
                        decimals: balance.change.decimals,
                    },
                    sourceBalance: balance.post,
                    sourcePreBalance: balance.pre,
                },
                idx: idx,
                timestamp: this.adapter.blockTime,
                signature: this.adapter.signature,
            },
        ];
    }
}
exports.JupiterVAParser = JupiterVAParser;
//# sourceMappingURL=parser-jupiter-va.js.map