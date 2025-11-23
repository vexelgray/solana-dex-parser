"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterDcaParser = void 0;
const borsh_1 = require("borsh");
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_parser_1 = require("../base-parser");
const jupiter_dca_layout_1 = require("./layouts/jupiter-dca.layout");
class JupiterDcaParser extends base_parser_1.BaseParser {
    processTrades() {
        const trades = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (programId == constants_1.DEX_PROGRAMS.JUPITER_DCA.id) {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = Buffer.from(data.slice(0, 16));
                if (discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_DCA.FILLED)) {
                    trades.push(this.parseFullFilled(instruction, `${outerIndex}-${innerIndex ?? 0}`));
                }
            }
        });
        return trades;
    }
    parseFullFilled(instruction, idx) {
        const eventData = (0, utils_1.getInstructionData)(instruction).slice(16);
        const layout = (0, borsh_1.deserializeUnchecked)(jupiter_dca_layout_1.JupiterDCAFilledLayout.schema, jupiter_dca_layout_1.JupiterDCAFilledLayout, Buffer.from(eventData));
        const event = layout.toObject();
        const tradeType = (0, utils_1.getTradeType)(event.inputMint, event.outputMint);
        const [inputDecimal, outputDecimal, feeDecimal] = [
            this.adapter.splDecimalsMap.get(event.inputMint),
            this.adapter.splDecimalsMap.get(event.outputMint),
            this.adapter.splDecimalsMap.get(event.feeMint),
        ];
        const trade = {
            type: tradeType,
            Pool: [],
            inputToken: {
                mint: event.inputMint,
                amount: (0, types_1.convertToUiAmount)(event.inAmount, inputDecimal),
                amountRaw: event.inAmount.toString(),
                decimals: inputDecimal ?? 0,
            },
            outputToken: {
                mint: event.outputMint,
                amount: (0, types_1.convertToUiAmount)(event.outAmount, outputDecimal),
                amountRaw: event.outAmount.toString(),
                decimals: outputDecimal ?? 0,
            },
            fee: {
                mint: event.feeMint,
                amount: (0, types_1.convertToUiAmount)(event.fee, feeDecimal),
                amountRaw: event.fee.toString(),
                decimals: feeDecimal ?? 0,
            },
            user: event.userKey,
            programId: constants_1.DEX_PROGRAMS.JUPITER_DCA.id,
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
        return amms.length > 0 ? amms[0] : this.dexInfo?.amm || constants_1.DEX_PROGRAMS.JUPITER_DCA.name;
    }
    processTransfers() {
        const transfers = [];
        this.classifiedInstructions.forEach(({ instruction, programId, outerIndex, innerIndex }) => {
            if (programId == constants_1.DEX_PROGRAMS.JUPITER_DCA.id) {
                const data = (0, utils_1.getInstructionData)(instruction);
                const discriminator = Buffer.from(data.slice(0, 8));
                if (discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_DCA.CLOSE_DCA)) {
                    transfers.push(...this.parseCloseDca(instruction, programId, `${outerIndex}-${innerIndex ?? 0}`));
                }
                else if (discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_DCA.OPEN_DCA) ||
                    discriminator.equals(constants_1.DISCRIMINATORS.JUPITER_DCA.OPEN_DCA_V2)) {
                    transfers.push(...this.parseOpenDca(instruction, programId, `${outerIndex}-${innerIndex ?? 0}`));
                }
            }
        });
        return transfers;
    }
    parseCloseDca(instruction, programId, idx) {
        const transfers = [];
        const user = this.adapter.signer;
        const balance = this.adapter.getAccountSolBalanceChanges().get(user);
        if (!balance)
            return [];
        const accounts = this.adapter.getInstructionAccounts(instruction);
        transfers.push({
            type: 'CloseDca',
            programId: programId,
            info: {
                authority: this.adapter.getTokenAccountOwner(accounts[1]),
                destination: user,
                destinationOwner: this.adapter.getTokenAccountOwner(user),
                mint: constants_1.TOKENS.SOL,
                source: accounts[1],
                tokenAmount: {
                    amount: balance.change.amount,
                    uiAmount: balance.change.uiAmount ?? 0,
                    decimals: balance.change.decimals,
                },
                destinationBalance: balance.post,
                destinationPreBalance: balance.pre,
            },
            idx: idx,
            timestamp: this.adapter.blockTime,
            signature: this.adapter.signature,
        });
        return transfers;
    }
    parseOpenDca(instruction, programId, idx) {
        const transfers = [];
        const user = this.adapter.signer;
        const balances = this.adapter.getAccountSolBalanceChanges();
        const balance = balances.get(user);
        if (!balance)
            return [];
        const accounts = this.adapter.getInstructionAccounts(instruction);
        transfers.push({
            type: 'OpenDca',
            programId: programId,
            info: {
                authority: this.adapter.getTokenAccountOwner(user),
                source: user,
                destination: accounts[0],
                destinationOwner: this.adapter.getTokenAccountOwner(accounts[0]),
                mint: constants_1.TOKENS.SOL,
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
        });
        return transfers;
    }
}
exports.JupiterDcaParser = JupiterDcaParser;
//# sourceMappingURL=parser-jupiter-dca.js.map