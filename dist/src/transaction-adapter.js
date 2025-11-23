"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAdapter = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const constants_1 = require("./constants");
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * Adapter for unified transaction data access
 */
class TransactionAdapter {
    constructor(tx, config) {
        this.tx = tx;
        this.config = config;
        this.accountKeys = [];
        this.splTokenMap = new Map();
        this.splDecimalsMap = new Map();
        this.defaultSolInfo = {
            mint: constants_1.TOKENS.SOL,
            amount: 0,
            amountRaw: '0',
            decimals: 9,
        };
        /**
         * Create base pool event data
         * @param type - Type of pool event
         * @param tx - The parsed transaction with metadata
         * @param programId - The program ID associated with the event
         * @returns Base pool event object
         */
        this.getPoolEventBase = (type, programId) => ({
            user: this.signer,
            type,
            programId,
            amm: (0, utils_1.getProgramName)(programId),
            slot: this.slot,
            timestamp: this.blockTime,
            signature: this.signature,
        });
        this.accountKeys = this.extractAccountKeys();
        this.extractTokenInfo();
    }
    get txMessage() {
        return this.tx.transaction.message;
    }
    get isMessageV0() {
        const message = this.tx.transaction.message;
        return (message instanceof web3_js_1.MessageV0 ||
            ('header' in message && 'staticAccountKeys' in message && 'compiledInstructions' in message));
    }
    /**
     * Get transaction slot
     */
    get slot() {
        return this.tx.slot;
    }
    get version() {
        return this.tx.version;
    }
    /**
     * Get transaction block time
     */
    get blockTime() {
        return this.tx.blockTime || 0;
    }
    /**
     * Get transaction signature
     */
    get signature() {
        return (0, utils_1.getPubkeyString)(this.tx.transaction.signatures[0]);
    }
    /**
     * Get all instructions
     */
    get instructions() {
        return this.txMessage.instructions || this.txMessage.compiledInstructions;
    }
    /**
     * Get inner instructions
     */
    get innerInstructions() {
        return this.tx.meta?.innerInstructions;
    }
    /**
     * Get pre balances
     */
    get preBalances() {
        return this.tx.meta?.preBalances;
    }
    /**
     * Get post balances
     */
    get postBalances() {
        return this.tx.meta?.postBalances;
    }
    /**
     * Get pre token balances
     */
    get preTokenBalances() {
        return this.tx.meta?.preTokenBalances;
    }
    /**
     * Get post token balances
     */
    get postTokenBalances() {
        return this.tx.meta?.postTokenBalances;
    }
    /**
     * Get first signer account
     */
    get signer() {
        return this.getAccountKey(0);
    }
    /**
     * Get Transaction signers
     * @returns Array of signer accounts as strings
     */
    get signers() {
        const message = this.tx.transaction.message;
        if (message instanceof web3_js_1.MessageV0 || 'header' in message) {
            const numRequiredSignatures = message.header.numRequiredSignatures || 1;
            return this.accountKeys.slice(0, numRequiredSignatures);
        }
        else if (this.version == 0 || this.version == 'legacy') {
            const keys = this.getAccountKeys(this.txMessage.accountKeys.filter((it) => it.signer == true));
            return keys.length > 0 ? keys : [this.signer];
        }
        return [this.signer];
    }
    get fee() {
        const fee = this.tx.meta?.fee || 0;
        return {
            amount: fee.toString(),
            uiAmount: (0, types_1.convertToUiAmount)(fee.toString(), 9),
            decimals: 9,
        };
    }
    get computeUnits() {
        return this.tx.meta?.computeUnitsConsumed || 0;
    }
    get txStatus() {
        if (this.tx.meta == null) {
            return 'unknown';
        }
        if (this.tx.meta.err == null) {
            return 'success';
        }
        return 'failed';
    }
    extractAccountKeys() {
        if (this.isMessageV0) {
            const keys = this.txMessage.staticAccountKeys.map((it) => (0, utils_1.getPubkeyString)(it)) || [];
            const key2 = this.tx.meta?.loadedAddresses?.writable.map((it) => (0, utils_1.getPubkeyString)(it)) || [];
            const key3 = this.tx.meta?.loadedAddresses?.readonly.map((it) => (0, utils_1.getPubkeyString)(it)) || [];
            return [...keys, ...key2, ...key3];
        }
        else if (this.version == 0) {
            // parsed transaction
            const keys = this.getAccountKeys(this.txMessage.accountKeys) || [];
            const key2 = this.getAccountKeys(this.tx.meta?.loadedAddresses?.writable ?? []) || [];
            const key3 = this.getAccountKeys(this.tx.meta?.loadedAddresses?.readonly ?? []) || [];
            return [...keys, ...key2, ...key3];
        }
        else {
            const meta = this.tx.meta;
            const keys = this.getAccountKeys(this.txMessage.accountKeys) || [];
            const key2 = this.getAccountKeys(meta?.loadedWritableAddresses ?? []) || [];
            const key3 = this.getAccountKeys(meta?.loadedReadonlyAddresses ?? []) || [];
            return [...keys, ...key2, ...key3];
        }
    }
    get addressTableLookups() {
        return this.txMessage.addressTableLookups || [];
    }
    get addressTableLookupKeys() {
        return this.getAccountKeys(this.addressTableLookups.map((it) => it.accountKey)) || [];
    }
    /**
     * Get unified instruction data
     */
    getInstruction(instruction) {
        const isParsed = !this.isCompiledInstruction(instruction);
        return {
            programId: isParsed ? (0, utils_1.getPubkeyString)(instruction.programId) : this.accountKeys[instruction.programIdIndex],
            accounts: this.getInstructionAccounts(instruction),
            data: 'data' in instruction ? (0, utils_1.decodeInstructionData)(instruction.data) : '',
            parsed: 'parsed' in instruction ? instruction.parsed : undefined,
            program: instruction.program || '',
        };
    }
    getInnerInstruction(outerIndex, innterIndex) {
        return this.innerInstructions?.find((it) => it.index == outerIndex)?.instructions[innterIndex];
    }
    getAccountKeys(accounts) {
        return accounts && accounts.length
            ? accounts.map((it) => {
                if (it instanceof web3_js_1.PublicKey)
                    return it.toBase58();
                if (typeof it == 'string')
                    return it;
                if (typeof it == 'number')
                    return this.accountKeys[it];
                if ('pubkey' in it)
                    return (0, utils_1.getPubkeyString)(it.pubkey);
                if (it instanceof Buffer)
                    return bs58_1.default.encode(it);
                if ('type' in it && it.type == 'Buffer')
                    return bs58_1.default.encode(it.data);
                if (Array.isArray(it))
                    return bs58_1.default.encode(it);
                return it;
            })
            : [];
    }
    getInstructionAccounts(instruction) {
        const accounts = instruction.accounts || instruction.accountKeyIndexes;
        if (!accounts)
            return [];
        if (typeof accounts == 'string') {
            return this.getAccountKeys(Array.from(bs58_1.default.decode(accounts)));
        }
        if (accounts instanceof Buffer) {
            return this.getAccountKeys(Array.from(accounts));
        }
        if ('type' in accounts && accounts.type == 'Buffer') {
            return this.getAccountKeys(Array.from(accounts.data));
        }
        return this.getAccountKeys(accounts);
    }
    /**
     * Check if instruction is Compiled
     */
    isCompiledInstruction(instruction) {
        return 'programIdIndex' in instruction && !('parsed' in instruction);
    }
    /**
     * Get instruction type
     * returns string name if instruction Parsed, e.g. 'transfer';
     * returns number if instruction is Compiled, e.g. 3
     */
    getInstructionType(instruction) {
        if ('parsed' in instruction && instruction.parsed) {
            return instruction.parsed.type; // string name, e.g. 'transfer'
        }
        // For compiled instructions, try to decode type from data
        const data = (0, utils_1.getInstructionData)(instruction);
        return data.length > 0 ? data[0].toString() : undefined; // number, e.g. 3
    }
    /**
     * Get account key by index
     */
    getAccountKey(index) {
        return this.accountKeys[index];
    }
    getAccountIndex(address) {
        return this.accountKeys.findIndex((it) => it == address);
    }
    /**
     * Get token account owner
     */
    getTokenAccountOwner(accountKey) {
        const accountInfo = this.tx.meta?.postTokenBalances?.find((balance) => this.accountKeys[balance.accountIndex] === accountKey);
        if (accountInfo) {
            return accountInfo.owner;
        }
        return undefined;
    }
    getAccountBalance(accountKeys) {
        return accountKeys.map((accountKey) => {
            if (accountKey == '')
                return undefined;
            const index = this.accountKeys.findIndex((it) => it == accountKey);
            if (index == -1)
                return undefined;
            const amount = this.tx.meta?.postBalances[index] || 0;
            return {
                amount: amount.toString(),
                uiAmount: (0, types_1.convertToUiAmount)(amount.toString()),
                decimals: 9,
            };
        });
    }
    getAccountPreBalance(accountKeys) {
        return accountKeys.map((accountKey) => {
            if (accountKey == '')
                return undefined;
            const index = this.accountKeys.findIndex((it) => it == accountKey);
            if (index == -1)
                return undefined;
            const amount = this.tx.meta?.preBalances[index] || 0;
            return {
                amount: amount.toString(),
                uiAmount: (0, types_1.convertToUiAmount)(amount.toString()),
                decimals: 9,
            };
        });
    }
    getTokenAccountBalance(accountKeys) {
        return accountKeys.map((accountKey) => accountKey == ''
            ? undefined
            : this.tx.meta?.postTokenBalances?.find((balance) => this.accountKeys[balance.accountIndex] === accountKey)
                ?.uiTokenAmount);
    }
    getTokenAccountPreBalance(accountKeys) {
        return accountKeys.map((accountKey) => accountKey == ''
            ? undefined
            : this.tx.meta?.preTokenBalances?.find((balance) => this.accountKeys[balance.accountIndex] === accountKey)
                ?.uiTokenAmount);
    }
    /**
     * Check if token is supported
     */
    isSupportedToken(mint) {
        return Object.values(constants_1.TOKENS).includes(mint);
    }
    /**
     * Get program ID from instruction
     */
    getInstructionProgramId(instruction) {
        const ix = this.getInstruction(instruction);
        return ix.programId;
    }
    getTokenDecimals(mint) {
        return this.splDecimalsMap.get(mint) || 0;
    }
    /**
     * Extract token information from transaction
     */
    extractTokenInfo() {
        // Process token balances
        this.extractTokenBalances();
        // Process transfer instructions for additional token info
        this.extractTokenFromInstructions();
        // Add SOL token info if not exists
        if (!this.splTokenMap.has(constants_1.TOKENS.SOL)) {
            this.splTokenMap.set(constants_1.TOKENS.SOL, this.defaultSolInfo);
        }
        if (!this.splDecimalsMap.has(constants_1.TOKENS.SOL)) {
            this.splDecimalsMap.set(constants_1.TOKENS.SOL, this.defaultSolInfo.decimals);
        }
    }
    /**
     * Extract token balances from pre and post states
     */
    extractTokenBalances() {
        const postBalances = this.postTokenBalances || [];
        postBalances.forEach((balance) => {
            if (!balance.mint)
                return;
            const accountKey = this.accountKeys[balance.accountIndex];
            if (!this.splTokenMap.has(accountKey)) {
                const tokenInfo = {
                    mint: balance.mint,
                    amount: balance.uiTokenAmount.uiAmount || 0,
                    amountRaw: balance.uiTokenAmount.amount,
                    decimals: balance.uiTokenAmount.decimals,
                };
                this.splTokenMap.set(accountKey, tokenInfo);
            }
            if (!this.splDecimalsMap.has(balance.mint)) {
                this.splDecimalsMap.set(balance.mint, balance.uiTokenAmount.decimals);
            }
        });
    }
    /**
     * Extract token info from transfer instructions
     */
    extractTokenFromInstructions() {
        this.instructions.forEach((ix) => {
            if (this.isCompiledInstruction(ix)) {
                this.extractFromCompiledTransfer(ix);
            }
            else {
                this.extractFromParsedTransfer(ix);
            }
        });
        // Process inner instructions
        this.innerInstructions?.forEach((inner) => {
            inner.instructions.forEach((ix) => {
                if (this.isCompiledInstruction(ix)) {
                    this.extractFromCompiledTransfer(ix);
                }
                else {
                    this.extractFromParsedTransfer(ix);
                }
            });
        });
    }
    setTokenInfo(source, destination, mint, decimals) {
        if (source) {
            if (this.splTokenMap.has(source) && mint && decimals) {
                this.splTokenMap.set(source, { mint, amount: 0, amountRaw: '0', decimals });
            }
            else if (!this.splTokenMap.has(source)) {
                this.splTokenMap.set(source, {
                    mint: mint || constants_1.TOKENS.SOL,
                    amount: 0,
                    amountRaw: '0',
                    decimals: decimals || 9,
                });
            }
        }
        if (destination) {
            if (this.splTokenMap.has(destination) && mint && decimals) {
                this.splTokenMap.set(destination, { mint, amount: 0, amountRaw: '0', decimals });
            }
            else if (!this.splTokenMap.has(destination)) {
                this.splTokenMap.set(destination, {
                    mint: mint || constants_1.TOKENS.SOL,
                    amount: 0,
                    amountRaw: '0',
                    decimals: decimals || 9,
                });
            }
        }
        if (mint && decimals && !this.splDecimalsMap.has(mint)) {
            this.splDecimalsMap.set(mint, decimals);
        }
    }
    /**
     * Extract token info from parsed transfer instruction
     */
    extractFromParsedTransfer(ix) {
        if (!ix.parsed || !ix.program)
            return;
        if (ix.programId != constants_1.TOKEN_PROGRAM_ID && ix.programId != constants_1.TOKEN_2022_PROGRAM_ID)
            return;
        const { source, destination, mint, decimals } = ix.parsed?.info || {};
        if (!source && !destination)
            return;
        this.setTokenInfo(source, destination, mint, decimals);
    }
    /**
     * Extract token info from compiled transfer instruction
     */
    extractFromCompiledTransfer(ix) {
        const decoded = (0, utils_1.getInstructionData)(ix);
        if (!decoded)
            return;
        const programId = this.accountKeys[ix.programIdIndex];
        if (programId != constants_1.TOKEN_PROGRAM_ID && programId != constants_1.TOKEN_2022_PROGRAM_ID)
            return;
        let source, destination, mint, decimals;
        // const amount = decoded.readBigUInt64LE(1);
        const accounts = ix.accounts;
        if (!accounts)
            return;
        switch (decoded[0]) {
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.Transfer:
                if (accounts.length < 3)
                    return;
                [source, destination] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // source, destination,amount, authority
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.TransferChecked:
                if (accounts.length < 4)
                    return;
                [source, mint, destination] = [
                    this.accountKeys[accounts[0]],
                    this.accountKeys[accounts[1]],
                    this.accountKeys[accounts[2]],
                ]; // source, mint, destination, authority,amount,decimals
                decimals = decoded.readUint8(9);
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.InitializeMint:
                if (accounts.length < 2)
                    return;
                [mint, destination] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // mint, decimals, authority,freezeAuthority
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.MintTo:
                if (accounts.length < 2)
                    return;
                [mint, destination] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // mint, destination, authority, amount
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.MintToChecked:
                if (accounts.length < 3)
                    return;
                [mint, destination] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // mint, destination, authority, amount,decimals
                decimals = decoded.readUint8(9);
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.Burn:
                if (accounts.length < 2)
                    return;
                [source, mint] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // account, mint, authority, amount
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.BurnChecked:
                if (accounts.length < 3)
                    return;
                [source, mint] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // account, mint, authority, amount,decimals
                decimals = decoded.readUint8(9);
                break;
            case constants_1.SPL_TOKEN_INSTRUCTION_TYPES.CloseAccount:
                if (accounts.length < 3)
                    return;
                [source, destination] = [this.accountKeys[accounts[0]], this.accountKeys[accounts[1]]]; // account, destination, authority
                break;
        }
        this.setTokenInfo(source, destination, mint, decimals);
    }
    /**
     * Get SOL balance changes for all accounts in the transaction
     * @returns Map<string, {pre: TokenAmount; post: TokenAmount; change: TokenAmount}> - A map where:
     *   - key: account address
     *   - value: Object containing:
     *     - pre: TokenAmount for pre-transaction balance, containing:
     *       - amount: balance in raw lamports
     *       - uiAmount: balance in SOL
     *       - decimals: number of decimal places (9 for SOL)
     *     - post: TokenAmount for post-transaction balance
     *     - change: TokenAmount for net balance change
     */
    getAccountSolBalanceChanges(isOwner = false) {
        const changes = new Map();
        this.accountKeys.forEach((key, index) => {
            const accountKey = isOwner ? this.getTokenAccountOwner(key) || key : key;
            const preBalance = this.preBalances?.[index] || 0;
            const postBalance = this.postBalances?.[index] || 0;
            const change = postBalance - preBalance;
            if (change !== 0) {
                changes.set(accountKey, {
                    pre: {
                        amount: preBalance.toString(),
                        uiAmount: (0, types_1.convertToUiAmount)(preBalance.toString(), 9),
                        decimals: 9,
                    },
                    post: {
                        amount: postBalance.toString(),
                        uiAmount: (0, types_1.convertToUiAmount)(postBalance.toString(), 9),
                        decimals: 9,
                    },
                    change: {
                        amount: change.toString(),
                        uiAmount: (0, types_1.convertToUiAmount)(change.toString(), 9),
                        decimals: 9,
                    },
                });
            }
        });
        return changes;
    }
    /**
     * Get token balance changes for all accounts in the transaction
     * @returns Map<string, Map<string, {pre: TokenAmount; post: TokenAmount; change: TokenAmount}>> - A nested map where:
     *   - outer key: account address
     *   - inner key: token mint address
     *   - value: Object containing:
     *     - pre: TokenAmount for pre-transaction balance
     *     - post: TokenAmount for post-transaction balance
     *     - change: TokenAmount for net balance change
     */
    getAccountTokenBalanceChanges(isOwner = false) {
        const changes = new Map();
        // Process pre token balances
        this.preTokenBalances?.forEach((balance) => {
            const key = this.accountKeys[balance.accountIndex];
            const accountKey = isOwner ? this.getTokenAccountOwner(key) || key : key;
            const mint = balance.mint;
            if (!mint)
                return;
            if (!changes.has(accountKey)) {
                changes.set(accountKey, new Map());
            }
            const accountChanges = changes.get(accountKey);
            accountChanges.set(mint, {
                pre: balance.uiTokenAmount,
                post: {
                    amount: '0',
                    uiAmount: 0,
                    decimals: balance.uiTokenAmount.decimals,
                },
                change: {
                    amount: '0',
                    uiAmount: 0,
                    decimals: balance.uiTokenAmount.decimals,
                },
            });
        });
        // Process post token balances and calculate changes
        this.postTokenBalances?.forEach((balance) => {
            const key = this.accountKeys[balance.accountIndex];
            const accountKey = isOwner ? this.getTokenAccountOwner(key) || key : key;
            const mint = balance.mint;
            if (!mint)
                return;
            if (!changes.has(accountKey)) {
                changes.set(accountKey, new Map());
            }
            const accountChanges = changes.get(accountKey);
            const existingChange = accountChanges.get(mint);
            if (existingChange) {
                // Update post balance and calculate change
                existingChange.post = balance.uiTokenAmount;
                const amountChange = BigInt(balance.uiTokenAmount.amount) - BigInt(existingChange.pre.amount);
                const uiAmountChange = (balance.uiTokenAmount.uiAmount || 0) - (existingChange.pre.uiAmount || 0);
                existingChange.change = {
                    amount: amountChange.toString(),
                    uiAmount: uiAmountChange,
                    decimals: balance.uiTokenAmount.decimals,
                };
                if (amountChange === 0n) {
                    accountChanges.delete(mint);
                    if (accountChanges.size === 0) {
                        changes.delete(accountKey);
                    }
                }
            }
            else {
                // If no pre-balance exists, set pre to zero
                accountChanges.set(mint, {
                    pre: {
                        amount: '0',
                        uiAmount: 0,
                        decimals: balance.uiTokenAmount.decimals,
                    },
                    post: balance.uiTokenAmount,
                    change: balance.uiTokenAmount,
                });
            }
        });
        return changes;
    }
}
exports.TransactionAdapter = TransactionAdapter;
//# sourceMappingURL=transaction-adapter.js.map