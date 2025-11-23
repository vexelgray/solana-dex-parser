"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoonitEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const base_event_parser_1 = require("../base-event-parser");
const binary_reader_1 = require("../binary-reader");
const transaction_utils_1 = require("../../transaction-utils");
class MoonitEventParser extends base_event_parser_1.BaseEventParser {
    constructor(adapter, transferActions) {
        super(adapter, transferActions);
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.eventParsers = {
            BUY: {
                discriminators: [
                    constants_1.DISCRIMINATORS.MOONIT.BUY,
                ],
                slice: 8,
                decode: this.decodeBuyEvent.bind(this),
            },
            SELL: {
                discriminators: [
                    constants_1.DISCRIMINATORS.MOONIT.SELL,
                ],
                slice: 8,
                decode: this.decodeSellEvent.bind(this),
            },
            CREATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.MOONIT.CREATE,
                ],
                slice: 8,
                decode: this.decodeCreateEvent.bind(this),
            },
            MIGRATE: {
                discriminators: [
                    constants_1.DISCRIMINATORS.MOONIT.MIGRATE,
                ],
                slice: 8,
                decode: this.decodeMigrateEvent.bind(this),
            },
        };
        this.utils = new transaction_utils_1.TransactionUtils(adapter);
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getMultiInstructions([constants_1.DEX_PROGRAMS.MOONIT.id, constants_1.METAPLEX_PROGRAM_ID]);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ programId, instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                for (const [_, parser] of Object.entries(this.eventParsers)) {
                    const discriminator = buffer_1.Buffer.from(data.slice(0, parser.slice));
                    if (parser.discriminators.some((it) => discriminator.equals(it))) {
                        const options = {
                            instruction,
                            programId,
                            outerIndex,
                            innerIndex,
                        };
                        const memeEvent = parser.decode(data.slice(parser.slice), options);
                        if (!memeEvent)
                            return null;
                        memeEvent.signature = this.adapter.signature;
                        memeEvent.slots = this.adapter.slot;
                        memeEvent.timestamp = this.adapter.blockTime;
                        memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                        return memeEvent;
                    }
                }
            }
            catch (error) {
                console.error('Failed to parse Moonit event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeBuyEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const outputAmount = reader.readU64();
        const inputAmount = reader.readU64();
        const [baseMint, pool, user] = [accounts[6], accounts[2], accounts[0]];
        const inputMint = constants_1.TOKENS.SOL;
        const outputMint = baseMint;
        const event = {
            protocol: constants_1.DEX_PROGRAMS.MOONIT.name,
            type: 'BUY',
            baseMint: outputMint, // base_mint
            quoteMint: inputMint, // quote_mint
            bondingCurve: pool, // pool
            pool: pool, // pool
            user: user,
            inputToken: {
                mint: inputMint,
                amountRaw: inputAmount.toString(),
            },
            outputToken: {
                mint: outputMint,
                amountRaw: outputAmount.toString(),
            },
            platformConfig: accounts[12]
        };
        return this.utils.processMemeTransferData(options, event, outputMint, false, 0, this.transferActions);
    }
    decodeSellEvent(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const [user, pool, dexFeeMint, helioFeeMint, baseMint] = [accounts[0], accounts[2], accounts[4], accounts[5], accounts[6]];
        const collateralMint = this.detectCollateralMint(accounts);
        const { tokenAmount, collateralAmount, dexFeeAmount, helioFeeAmount } = this.calculateAmounts(baseMint, collateralMint, dexFeeMint, helioFeeMint);
        const event = {
            protocol: constants_1.DEX_PROGRAMS.MOONIT.name,
            type: 'SELL',
            baseMint: baseMint, // base_mint
            quoteMint: collateralMint, // quote_mint
            bondingCurve: pool, // pool
            pool: pool, // pool
            user: user,
            inputToken: {
                mint: baseMint,
                amountRaw: tokenAmount.amount.toString(),
                amount: tokenAmount.uiAmount,
                decimals: tokenAmount.decimals
            },
            outputToken: {
                mint: collateralMint,
                amountRaw: collateralAmount.amount.toString(),
                amount: collateralAmount.uiAmount,
                decimals: collateralAmount.decimals
            },
            fee: Number(dexFeeAmount.amount)
        };
        return event;
    }
    decodeCreateEvent(data, options) {
        const reader = new binary_reader_1.BinaryReader(data);
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const name = reader.readString();
        const symbol = reader.readString();
        const uri = reader.readString();
        const decimals = reader.readU8();
        reader.readU8(); // skip
        const totalSupply = (0, types_1.convertToUiAmount)(reader.readU64(), decimals);
        const [pool, baseMint, user] = [accounts[2], accounts[3], accounts[0]];
        return {
            protocol: constants_1.DEX_PROGRAMS.MOONIT.name,
            type: 'CREATE',
            timestamp: this.adapter.blockTime,
            pool: pool,
            bondingCurve: pool,
            user: user,
            creator: user,
            baseMint: baseMint,
            quoteMint: constants_1.TOKENS.SOL,
            name: name,
            symbol: symbol,
            uri: uri,
            decimals: decimals,
            totalSupply: totalSupply,
        };
    }
    decodeMigrateEvent(data, options) {
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const [bondingCurve, baseMint] = [accounts[2], accounts[5]];
        return {
            protocol: constants_1.DEX_PROGRAMS.MOONIT.name,
            type: 'MIGRATE',
            timestamp: this.adapter.blockTime,
            bondingCurve: bondingCurve,
            baseMint: baseMint,
            quoteMint: constants_1.TOKENS.SOL,
        };
    }
    detectCollateralMint(accountKeys) {
        if (accountKeys.some((key) => key === constants_1.TOKENS.USDC))
            return constants_1.TOKENS.USDC;
        if (accountKeys.some((key) => key === constants_1.TOKENS.USDT))
            return constants_1.TOKENS.USDT;
        return constants_1.TOKENS.SOL;
    }
    calculateAmounts(tokenMint, collateralMint, dexFeeMint, helioFeeMint) {
        const tokenBalanceChanges = this.getTokenBalanceChanges(tokenMint);
        const collateralBalanceChanges = this.getTokenBalanceChanges(collateralMint);
        const dexFeeBalanceChanges = this.getTokenBalanceChanges(dexFeeMint);
        const helioFeeBalanceChanges = this.getTokenBalanceChanges(helioFeeMint);
        return {
            tokenAmount: this.createTokenAmount((0, utils_1.absBigInt)(tokenBalanceChanges), tokenMint),
            collateralAmount: this.createTokenAmount((0, utils_1.absBigInt)(collateralBalanceChanges), collateralMint),
            dexFeeAmount: this.createTokenAmount((0, utils_1.absBigInt)(dexFeeBalanceChanges), dexFeeMint),
            helioFeeAmount: this.createTokenAmount((0, utils_1.absBigInt)(helioFeeBalanceChanges), helioFeeMint),
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
exports.MoonitEventParser = MoonitEventParser;
//# sourceMappingURL=parser-moonit-event.js.map