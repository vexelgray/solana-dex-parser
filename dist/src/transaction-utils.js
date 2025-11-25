"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionUtils = void 0;
const constants_1 = require("./constants");
const transfer_compiled_utils_1 = require("./transfer-compiled-utils");
const transfer_utils_1 = require("./transfer-utils");
const utils_1 = require("./utils");
class TransactionUtils {
    constructor(adapter) {
        this.adapter = adapter;
        /**
         * Sort and get LP tokens
         * make sure token0 is SPL Token, token1 is SOL/USDC/USDT
         * SOL,USDT > buy
         * SOL,DDD > buy
         * USDC,USDT/DDD > buy
         * USDT,USDC
         * DDD,USDC > sell
         * USDC,SOL > sell
         * USDT,SOL > sell
         * @param transfers
         * @returns
         */
        this.getLPTransfers = (transfers) => {
            const tokens = transfers.filter((it) => it.type.includes('transfer'));
            if (tokens.length >= 2) {
                if (tokens[0].info.mint == constants_1.TOKENS.SOL ||
                    (this.adapter.isSupportedToken(tokens[0].info.mint) && !this.adapter.isSupportedToken(tokens[1].info.mint))) {
                    return [tokens[1], tokens[0]];
                }
            }
            return tokens;
        };
        this.attachTokenTransferInfo = (trade, transferActions) => {
            const inputTransfer = Object.values(transferActions)
                .flat()
                .find((it) => it.info.mint == trade.inputToken.mint && it.info.tokenAmount?.amount == trade.inputToken.amountRaw);
            const outputTransfer = Object.values(transferActions)
                .flat()
                .find((it) => it.info.mint == trade.outputToken.mint && it.info.tokenAmount?.amount == trade.outputToken.amountRaw);
            const [solChanges, tokenChanges] = [
                this.adapter.getAccountSolBalanceChanges(false),
                this.adapter.getAccountTokenBalanceChanges(true),
            ];
            const inputAmt = trade.inputToken.mint == constants_1.TOKENS.SOL
                ? solChanges.get(trade.user)
                : tokenChanges.get(trade.user)?.get(trade.inputToken.mint);
            const outputAmt = trade.outputToken.mint == constants_1.TOKENS.SOL
                ? solChanges.get(trade.user)
                : tokenChanges.get(trade.user)?.get(trade.outputToken.mint);
            trade.inputToken.balanceChange = (inputAmt?.change?.amount || trade.inputToken.amountRaw).replace('-', ''); // abs value
            trade.outputToken.balanceChange = outputAmt?.change?.amount || trade.outputToken.amountRaw;
            if (inputTransfer) {
                trade.inputToken.authority = inputTransfer.info.authority;
                trade.inputToken.source = inputTransfer.info.source;
                trade.inputToken.destination = inputTransfer.info.destination;
                trade.inputToken.destinationOwner = inputTransfer.info.destinationOwner;
                trade.inputToken.destinationBalance = inputTransfer.info.destinationBalance;
                trade.inputToken.destinationPreBalance = inputTransfer.info.destinationPreBalance;
                trade.inputToken.sourceBalance = inputTransfer.info.sourceBalance;
                trade.inputToken.sourcePreBalance = inputTransfer.info.sourcePreBalance;
            }
            else {
                trade.inputToken.sourceBalance = inputAmt?.post;
                trade.inputToken.sourcePreBalance = inputAmt?.pre;
            }
            if (outputTransfer) {
                trade.outputToken.authority = outputTransfer.info.authority;
                trade.outputToken.source = outputTransfer.info.source;
                trade.outputToken.destination = outputTransfer.info.destination;
                trade.outputToken.destinationOwner = outputTransfer.info.destinationOwner;
                trade.outputToken.destinationBalance = outputTransfer.info.destinationBalance;
                trade.outputToken.destinationPreBalance = outputTransfer.info.destinationPreBalance;
                trade.outputToken.sourceBalance = outputTransfer.info.sourceBalance;
                trade.outputToken.sourcePreBalance = outputTransfer.info.sourcePreBalance;
            }
            else {
                trade.outputToken.destinationBalance = outputAmt?.post;
                trade.outputToken.destinationPreBalance = outputAmt?.pre;
            }
            trade.signer = this.adapter.signers;
            return trade;
        };
        this.attachUserBalanceToLPs = (liquidities) => {
            liquidities.forEach((it) => {
                const [solChanges, tokenChanges] = [
                    this.adapter.getAccountSolBalanceChanges(false),
                    this.adapter.getAccountTokenBalanceChanges(true),
                ];
                const solAmt = solChanges.get(it.user);
                const [token0Amt, token1Amt] = [
                    it.token0Mint == constants_1.TOKENS.SOL ? solAmt : tokenChanges.get(it.user)?.get(it.token0Mint),
                    it.token1Mint == constants_1.TOKENS.SOL ? solAmt : tokenChanges.get(it.user)?.get(it.token1Mint),
                ];
                it.token0BalanceChange = token0Amt?.change?.amount || it.token0AmountRaw;
                it.token1BalanceChange = token1Amt?.change?.amount || it.token1AmountRaw;
                it.signer = this.adapter.signers;
            });
            return liquidities;
        };
    }
    /**
     * Get DEX information from transaction
     */
    getDexInfo(classifier) {
        const programIds = classifier.getAllProgramIds();
        if (!programIds.length)
            return {};
        for (const programId of programIds) {
            const dexProgram = Object.values(constants_1.DEX_PROGRAMS).find((dex) => dex.id === programId);
            if (dexProgram) {
                const isRoute = !dexProgram.tags.includes('amm');
                return {
                    programId: dexProgram.id,
                    route: isRoute ? dexProgram.name : undefined,
                    amm: !isRoute ? dexProgram.name : undefined,
                };
            }
        }
        return { programId: programIds[0] };
    }
    /**
     * Get transfer actions from transaction
     */
    getTransferActions(extraTypes) {
        const actions = {};
        const innerInstructions = this.adapter.innerInstructions;
        let groupKey = '';
        // process transfers of program instructions
        innerInstructions?.forEach((set) => {
            const outerIndex = set.index;
            const outerInstruction = this.adapter.instructions[outerIndex];
            const outerProgramId = this.adapter.getInstructionProgramId(outerInstruction);
            if (constants_1.SYSTEM_PROGRAMS.includes(outerProgramId))
                return;
            groupKey = `${outerProgramId}:${outerIndex}`;
            set.instructions.forEach((ix, innerIndex) => {
                const innerProgramId = this.adapter.getInstructionProgramId(ix);
                // Special case for meteora vault
                if (!constants_1.SYSTEM_PROGRAMS.includes(innerProgramId) && !this.isIgnoredProgram(innerProgramId)) {
                    groupKey = `${innerProgramId}:${outerIndex}-${innerIndex}`;
                    return;
                }
                const transferData = this.parseInstructionAction(ix, `${outerIndex}-${innerIndex}`, extraTypes);
                if (transferData) {
                    if (constants_1.FEE_ACCOUNTS.some((it) => [transferData.info.destination, transferData.info.destinationOwner].includes(it))) {
                        transferData.isFee = true;
                    }
                    if (actions[groupKey]) {
                        actions[groupKey].push(transferData);
                    }
                    else {
                        actions[groupKey] = [transferData];
                    }
                }
            });
        });
        // process transfers without program
        groupKey = 'transfer';
        this.adapter.instructions?.forEach((ix, outerIndex) => {
            const transferData = this.parseInstructionAction(ix, `${outerIndex}`, extraTypes);
            if (transferData) {
                if (actions[groupKey]) {
                    actions[groupKey].push(transferData);
                }
                else {
                    actions[groupKey] = [transferData];
                }
            }
        });
        return actions;
    }
    processTransferInstructions(outerIndex, extraTypes) {
        const innerInstructions = this.adapter.innerInstructions;
        if (!innerInstructions)
            return [];
        return innerInstructions
            .filter((set) => set.index === outerIndex)
            .flatMap((set) => set.instructions
            .map((instruction, idx) => {
            const items = this.parseInstructionAction(instruction, `${outerIndex}-${idx}`, extraTypes);
            return items;
        })
            .filter((transfer) => transfer !== null));
    }
    /**
     * Parse instruction actions (both parsed and compiled)
     * actions: transfer/transferCheced/mintTo/burn
     */
    parseInstructionAction(instruction, idx, extraTypes) {
        const ix = this.adapter.getInstruction(instruction);
        // Handle parsed instruction
        if (ix.parsed) {
            return this.parseParsedInstructionAction(ix, idx, extraTypes);
        }
        // Handle compiled instruction
        return this.parseCompiledInstructionAction(ix, idx, extraTypes);
    }
    /**
     * Parse parsed instruction
     */
    parseParsedInstructionAction(instruction, idx, extraTypes) {
        if ((0, transfer_utils_1.isTransfer)(instruction)) {
            return (0, transfer_utils_1.processTransfer)(instruction, idx, this.adapter);
        }
        if ((0, transfer_utils_1.isNativeTransfer)(instruction)) {
            return (0, transfer_utils_1.processNatvieTransfer)(instruction, idx, this.adapter);
        }
        if ((0, transfer_utils_1.isTransferCheck)(instruction)) {
            return (0, transfer_utils_1.processTransferCheck)(instruction, idx, this.adapter);
        }
        if (extraTypes) {
            const actions = extraTypes
                .map((it) => {
                if ((0, transfer_utils_1.isExtraAction)(instruction, it)) {
                    return (0, transfer_utils_1.processExtraAction)(instruction, idx, this.adapter, it);
                }
            })
                .filter((it) => !!it);
            return actions.length > 0 ? actions[0] : null;
        }
        return null;
    }
    /**
     * Parse compiled instruction
     */
    parseCompiledInstructionAction(instruction, idx, extraTypes) {
        if ((0, transfer_compiled_utils_1.isCompiledTransfer)(instruction)) {
            return (0, transfer_compiled_utils_1.processCompiledTransfer)(instruction, idx, this.adapter);
        }
        if ((0, transfer_compiled_utils_1.isCompiledNativeTransfer)(instruction)) {
            return (0, transfer_compiled_utils_1.processCompiledNatvieTransfer)(instruction, idx, this.adapter);
        }
        if ((0, transfer_compiled_utils_1.isCompiledTransferCheck)(instruction)) {
            return (0, transfer_compiled_utils_1.processCompiledTransferCheck)(instruction, idx, this.adapter);
        }
        if (extraTypes) {
            const actions = extraTypes
                .map((it) => {
                if ((0, transfer_compiled_utils_1.isCompiledExtraAction)(instruction, it)) {
                    return (0, transfer_compiled_utils_1.processCompiledExtraAction)(instruction, idx, this.adapter, it);
                }
            })
                .filter((it) => !!it);
            return actions.length > 0 ? actions[0] : null;
        }
        return null;
    }
    /**
     * Get mint from instruction
     */
    getMintFromInstruction(ix, info) {
        let mint = this.adapter.splTokenMap.get(info.destination)?.mint;
        if (!mint)
            mint = this.adapter.splTokenMap.get(info.source)?.mint;
        if (!mint && ix.programId === constants_1.TOKENS.NATIVE)
            mint = constants_1.TOKENS.SOL;
        return mint;
    }
    /**
     * Get token amount from instruction info
     */
    getTokenAmount(info, decimals) {
        if (info.tokenAmount)
            return info.tokenAmount;
        const amount = info.amount || info.lamports || '0';
        return {
            amount,
            decimals,
            uiAmount: Number(amount) / Math.pow(10, decimals),
        };
    }
    /**
     * Check if program should be ignored for grouping
     */
    isIgnoredProgram(programId) {
        return constants_1.SKIP_PROGRAM_IDS.includes(programId) ||
            Object.values(constants_1.DEX_PROGRAMS)
                .filter((it) => it.tags.includes('vault'))
                .map((it) => it.id)
                .includes(programId);
    }
    /**
     * Get transfer info from transfer data
     */
    getTransferInfo(transferData, timestamp, signature) {
        const { info } = transferData;
        if (!info || !info.tokenAmount)
            return null;
        const tokenInfo = {
            mint: info.mint || '',
            amount: info.tokenAmount.uiAmount,
            amountRaw: info.tokenAmount.amount,
            decimals: info.tokenAmount.decimals,
        };
        return {
            type: info.source === info.authority ? 'TRANSFER_OUT' : 'TRANSFER_IN',
            token: tokenInfo,
            from: info.source,
            to: info.destination,
            timestamp,
            signature,
        };
    }
    /**
     * Get transfer info list from transfer data
     */
    getTransferInfoList(transferDataList) {
        const timestamp = this.adapter.blockTime || 0;
        const signature = this.adapter.signature;
        return transferDataList
            .map((data) => this.getTransferInfo(data, timestamp, signature))
            .filter((info) => info !== null);
    }
    /**
     * Process swap data from transfers
     */
    processSwapData(transfers, dexInfo, skipNative = true) {
        if (!transfers.length) {
            throw new Error('No swap data provided');
        }
        const uniqueTokens = this.extractUniqueTokens(transfers, skipNative);
        if (uniqueTokens.length < 2) {
            return null;
            // throw `Insufficient unique tokens for swap`;
        }
        const signer = this.getSwapSigner();
        const { inputToken, outputToken, feeTransfer } = this.calculateTokenAmounts(signer, transfers, uniqueTokens);
        const trade = {
            type: (0, utils_1.getTradeType)(inputToken.mint, outputToken.mint),
            inputToken,
            outputToken,
            user: signer,
            programId: dexInfo.programId,
            amm: dexInfo.amm,
            route: dexInfo.route || '',
            slot: this.adapter.slot,
            timestamp: this.adapter.blockTime || 0,
            signature: this.adapter.signature,
            idx: transfers[0].idx,
        };
        if (feeTransfer) {
            trade.fee = {
                mint: feeTransfer.info.mint,
                amount: feeTransfer.info.tokenAmount.uiAmount,
                amountRaw: feeTransfer.info.tokenAmount.amount,
                decimals: feeTransfer.info.tokenAmount.decimals,
            };
        }
        return trade;
    }
    /**
     * Get signer for swap transaction
     */
    getSwapSigner() {
        const defaultSigner = this.adapter.accountKeys[0];
        // Check for Jupiter DCA program
        const isDCAProgram = this.adapter.accountKeys.find((key) => key === constants_1.DEX_PROGRAMS.JUPITER_DCA.id);
        return isDCAProgram ? this.adapter.accountKeys[2] : defaultSigner;
    }
    /**
     * Extract unique tokens from transfers
     */
    extractUniqueTokens(transfers, skipNative) {
        const uniqueTokens = [];
        const seenTokens = new Set();
        transfers.forEach((transfer) => {
            if (skipNative && transfer.info.mint == (constants_1.TOKENS.NATIVE)) {
                return; // Skip native SOL transfers in most case (fee/tip/createAccount)
            }
            const tokenInfo = this.getTransferTokenInfo(transfer);
            if (tokenInfo && !seenTokens.has(tokenInfo.mint)) {
                uniqueTokens.push(tokenInfo);
                seenTokens.add(tokenInfo.mint);
            }
        });
        return uniqueTokens;
    }
    /**
     * Calculate token amounts for swap
     */
    calculateTokenAmounts(signer, transfers, uniqueTokens) {
        let inputToken = uniqueTokens[0];
        let outputToken = uniqueTokens[uniqueTokens.length - 1];
        if ((outputToken.source == signer || outputToken.authority == signer)
            || (outputToken.source == constants_1.DEX_PROGRAMS.OKX_ROUTER.id || outputToken.authority == constants_1.DEX_PROGRAMS.OKX_ROUTER.id) // OKX router case
        ) {
            [inputToken, outputToken] = [outputToken, inputToken];
        }
        const { inputAmount, inputAmountRaw, outputAmount, outputAmountRaw, feeTransfer } = this.sumTokenAmounts(transfers, inputToken.mint, outputToken.mint);
        return {
            inputToken: {
                ...inputToken,
                amount: inputAmount,
                amountRaw: inputAmountRaw.toString(),
            },
            outputToken: {
                ...outputToken,
                amount: outputAmount,
                amountRaw: outputAmountRaw.toString(),
            },
            feeTransfer,
        };
    }
    /**
     * Sum token amounts from transfers
     */
    sumTokenAmounts(transfers, inputMint, outputMint) {
        const seenTransfers = new Set();
        let inputAmount = 0;
        let outputAmount = 0;
        let inputAmountRaw = 0n;
        let outputAmountRaw = 0n;
        let feeTransfer;
        transfers.forEach((transfer) => {
            const tokenInfo = this.getTransferTokenInfo(transfer);
            if (!tokenInfo)
                return;
            const destination = tokenInfo.destinationOwner || tokenInfo.destination || '';
            if (constants_1.FEE_ACCOUNTS.includes(destination)) {
                feeTransfer = transfer;
                return; // skip fee transfer
            }
            if (tokenInfo.authority == constants_1.DEX_PROGRAMS.OKX_ROUTER.id && destination == this.adapter.signer)
                return; // skip signer for OKX router case
            const key = `${tokenInfo.amount}-${tokenInfo.mint}`;
            if (seenTransfers.has(key))
                return;
            seenTransfers.add(key);
            if (tokenInfo.mint === inputMint) {
                inputAmount += tokenInfo.amount;
                inputAmountRaw += BigInt(tokenInfo.amountRaw);
            }
            if (tokenInfo.mint === outputMint) {
                outputAmount += tokenInfo.amount;
                outputAmountRaw += BigInt(tokenInfo.amountRaw);
            }
        });
        return { inputAmount, inputAmountRaw, outputAmount, outputAmountRaw, feeTransfer };
    }
    /**
     * Get token info from transfer data
     */
    getTransferTokenInfo(transfer) {
        return transfer?.info
            ? {
                mint: transfer.info.mint,
                amount: transfer.info.tokenAmount.uiAmount,
                amountRaw: transfer.info.tokenAmount.amount,
                decimals: transfer.info.tokenAmount.decimals,
                authority: transfer.info.authority,
                destination: transfer.info.destination,
                destinationOwner: transfer.info.destinationOwner,
                destinationBalance: transfer.info.destinationBalance,
                destinationPreBalance: transfer.info.destinationPreBalance,
                source: transfer.info.source,
                sourceBalance: transfer.info.sourceBalance,
                sourcePreBalance: transfer.info.sourcePreBalance,
            }
            : null;
    }
    /**
     * Process transfer data for meme token events
     * Handles the common transfer processing logic
     * @param cInst Classified instruction
     * @param event Meme event to update
     * @param baseMint Base token mint address
     * @param skipNative Whether to skip native SOL transfers
     * @param transferStartIdx Starting index for transfer processing
     * @returns Updated meme event or null if processing fails
     */
    processMemeTransferData(cInst, event, baseMint, skipNative, transferStartIdx, transferActions) {
        const transfers = this.getTransfersForInstruction(transferActions, cInst.programId, cInst.outerIndex, cInst.innerIndex);
        if (transfers.length < 2) {
            return event;
        }
        const dexInfo = {
            programId: cInst.programId,
            amm: this.getDexProgramName(cInst.programId),
            route: '', // Will be set by getDexInfo if needed
        };
        const trade = this.processSwapData(transfers.slice(transferStartIdx), dexInfo, skipNative);
        if (!trade) {
            return event;
        }
        // Validate trade direction and token mints
        if (event.type === 'BUY') {
            if (trade.outputToken.mint !== baseMint) {
                throw new Error(`baseMint mismatch: expected ${baseMint}, got ${trade.outputToken.mint}`);
            }
        }
        else if (event.type === 'SELL') {
            if (trade.inputToken.mint !== baseMint) {
                throw new Error(`baseMint mismatch: expected ${baseMint}, got ${trade.inputToken.mint}`);
            }
        }
        this.updateMemeTokenInfo(event, trade);
        return event;
    }
    /**
     * Get DEX program name by program ID
     * @param programId Program ID
     * @returns Program name or 'Unknown'
     */
    getDexProgramName(programId) {
        const dexProgram = Object.values(constants_1.DEX_PROGRAMS).find((dex) => dex.id === programId);
        return dexProgram?.name || 'Unknown';
    }
    /**
     * Update meme event token information from trade data
     * @param event Meme event to update
     * @param trade Trade information source
     */
    updateMemeTokenInfo(event, trade) {
        // Initialize token info if not exists
        if (!event.inputToken) {
            event.inputToken = {
                mint: '',
                amount: 0,
                amountRaw: '0',
                decimals: 0
            };
        }
        if (!event.outputToken) {
            event.outputToken = {
                mint: '',
                amount: 0,
                amountRaw: '0',
                decimals: 0
            };
        }
        // Update input token info
        event.inputToken.mint = trade.inputToken.mint;
        event.inputToken.amount = trade.inputToken.amount;
        event.inputToken.amountRaw = trade.inputToken.amountRaw;
        event.inputToken.decimals = trade.inputToken.decimals;
        // Update output token info
        event.outputToken.mint = trade.outputToken.mint;
        event.outputToken.amount = trade.outputToken.amount;
        event.outputToken.amountRaw = trade.outputToken.amountRaw;
        event.outputToken.decimals = trade.outputToken.decimals;
        // Update fee info if available
        if (trade.fee) {
            event.fee = trade.fee.amount;
        }
        else if (trade.fees && trade.fees.length > 0) {
            // Sum all fees if multiple fees exist
            let totalFee = 0;
            for (const fee of trade.fees) {
                totalFee += fee.amount;
            }
            event.fee = totalFee;
        }
    }
    /**
     * Filter transfers for a specific instruction
     * @param transferActions Map of transfer actions
     * @param programId Program ID
     * @param outerIndex Outer instruction index
     * @param innerIndex Inner instruction index (optional)
     * @param filterTypes Types to filter by
     * @returns Filtered transfer data array
     */
    filterTransfersForInstruction(transferActions, programId, outerIndex, innerIndex, filterTypes) {
        // Create the key to look up in the transferActions map
        let key = `${programId}:${outerIndex}`;
        if (innerIndex !== undefined) {
            key += `-${innerIndex}`;
        }
        // Get transfers for the instruction
        const transfers = transferActions[key];
        if (!transfers) {
            return [];
        }
        // If no filter types specified, return all transfers
        if (!filterTypes || filterTypes.length === 0) {
            return transfers;
        }
        // Filter transfers by type
        const result = [];
        for (const transfer of transfers) {
            for (const filterType of filterTypes) {
                if (transfer.type === filterType) {
                    result.push(transfer);
                    break;
                }
            }
        }
        return result;
    }
    /**
     * Get transfers for a specific instruction with default types
     * Default types: transfer, transferChecked
     * @param transferActions Map of transfer actions
     * @param programId Program ID
     * @param outerIndex Outer instruction index
     * @param innerIndex Inner instruction index (optional)
     * @param extraTypes Additional types to include
     * @returns Transfer data array
     */
    getTransfersForInstruction(transferActions, programId, outerIndex, innerIndex, extraTypes) {
        const defaultTypes = ['transfer', 'transferChecked'];
        if (extraTypes) {
            defaultTypes.push(...extraTypes);
        }
        return this.filterTransfersForInstruction(transferActions, programId, outerIndex, innerIndex, defaultTypes);
    }
}
exports.TransactionUtils = TransactionUtils;
//# sourceMappingURL=transaction-utils.js.map