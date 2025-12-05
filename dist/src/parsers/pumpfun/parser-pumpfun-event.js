"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PumpfunEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const decoders_1 = require("../../decoders");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
// Pumpfun mayhem mode fee recipient
const MAYHEM_FEE_RECIPIENT = 'GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS';
class PumpfunEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.PUMP_FUN.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                const buffer = buffer_1.Buffer.from(data);
                // Use IDL decoder to identify and decode the event
                const decoded = decoders_1.pumpfunDecoder.decodeAnyEvent(buffer);
                if (!decoded)
                    return null;
                // Detect launchpad platform from fee recipient
                const isMayhemMode = this.adapter.accountKeys.includes(MAYHEM_FEE_RECIPIENT);
                const platform = isMayhemMode ? 'pump_mayhem' : 'pump.fun';
                let memeEvent;
                switch (decoded.type) {
                    case 'TRADE':
                        memeEvent = this.convertTradeEvent(decoded.data, platform);
                        // Extract bonding curve from previous instruction
                        const prevInstruction = (0, utils_1.getPrevInstructionByIndex)(instructions, outerIndex, innerIndex);
                        if (prevInstruction) {
                            const accounts = this.adapter.getInstructionAccounts(prevInstruction.instruction);
                            if (accounts && accounts.length > 3) {
                                memeEvent.poolAddress = accounts[3];
                            }
                        }
                        break;
                    case 'CREATE':
                        memeEvent = this.convertCreateEvent(decoded.data, platform);
                        break;
                    case 'COMPLETE':
                        memeEvent = this.convertCompleteEvent(decoded.data, platform);
                        break;
                    case 'MIGRATE':
                        memeEvent = this.convertMigrateEvent(decoded.data, platform);
                        break;
                    default:
                        return null;
                }
                // Add common fields
                memeEvent.signature = this.adapter.signature;
                memeEvent.slot = this.adapter.slot;
                memeEvent.timestamp = this.adapter.blockTime;
                memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                return memeEvent;
            }
            catch (error) {
                console.error('Failed to parse Pumpfun event:', error);
                throw error;
            }
        })
            .filter((event) => event !== null));
    }
    convertTradeEvent(evt, platform) {
        let inputMint, outputMint;
        let inputAmount, outputAmount;
        let inputDecimals, outputDecimals;
        if (evt.isBuy) {
            inputMint = constants_1.TOKENS.SOL;
            inputAmount = evt.solAmount;
            inputDecimals = 9;
            outputMint = evt.mint;
            outputAmount = evt.tokenAmount;
            outputDecimals = 6;
        }
        else {
            inputMint = evt.mint;
            inputAmount = evt.tokenAmount;
            inputDecimals = 6;
            outputMint = constants_1.TOKENS.SOL;
            outputAmount = evt.solAmount;
            outputDecimals = 9;
        }
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            launchpad: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            platform,
            type: evt.isBuy ? 'BUY' : 'SELL',
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            user: evt.user,
            inputToken: {
                mint: inputMint,
                amountRaw: inputAmount.toString(),
                amount: (0, types_1.convertToUiAmount)(inputAmount, inputDecimals),
                decimals: inputDecimals,
            },
            outputToken: {
                mint: outputMint,
                amountRaw: outputAmount.toString(),
                amount: (0, types_1.convertToUiAmount)(outputAmount, outputDecimals),
                decimals: outputDecimals,
            },
            fee: evt.fee !== undefined ? Number(evt.fee) : undefined,
            creatorFee: evt.creatorFee !== undefined ? Number(evt.creatorFee) : undefined,
            // Bonding curve reserves after trade (Curve/Vault nomenclature)
            curveQuoteReserves: Number(evt.virtualSolReserves),
            curveBaseReserves: Number(evt.virtualTokenReserves),
            vaultQuoteReserves: evt.realSolReserves !== undefined ? Number(evt.realSolReserves) : undefined,
            vaultBaseReserves: evt.realTokenReserves !== undefined ? Number(evt.realTokenReserves) : undefined,
        };
    }
    convertCreateEvent(evt, platform) {
        // Token total supply for normalization
        const tokenTotalSupply = evt.tokenTotalSupply !== undefined ? Number(evt.tokenTotalSupply) : 1000000000000000;
        // Calculate initial reserves
        const curveBaseReserves = evt.virtualTokenReserves !== undefined ? Number(evt.virtualTokenReserves) : tokenTotalSupply;
        const curveQuoteReserves = evt.virtualSolReserves !== undefined ? Number(evt.virtualSolReserves) : 30000000000;
        const vaultBaseReserves = evt.realTokenReserves !== undefined ? Number(evt.realTokenReserves) : tokenTotalSupply;
        // SPL Token program (default for Pumpfun)
        const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            launchpad: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            platform,
            type: 'CREATE',
            timestamp: evt.timestamp !== undefined ? Number(evt.timestamp) : 0,
            user: evt.user,
            // Grouped token structures for CREATE events
            baseToken: {
                mint: evt.mint,
                name: evt.name,
                symbol: evt.symbol,
                uri: evt.uri,
                decimals: 6,
                totalSupply: tokenTotalSupply,
                programId: evt.tokenProgram || SPL_TOKEN_PROGRAM,
            },
            quoteToken: {
                mint: constants_1.TOKENS.SOL,
                symbol: 'SOL',
                decimals: 9,
            },
            creatorAddress: evt.creator || evt.user,
            poolAddress: evt.bondingCurve,
            configAddress: evt.bondingCurve, // Pumpfun uses bonding curve as config
            // Bonding curve reserves (Curve/Vault nomenclature)
            curveType: 'ConstantProduct', // Pumpfun uses constant product AMM (x * y = k)
            curveBaseReserves,
            curveQuoteReserves,
            vaultBaseReserves,
            vaultQuoteReserves: 0, // Initial SOL collected = 0
            // Goals
            initialSaleSupply: vaultBaseReserves,
            graduationThreshold: 85000000000, // Pumpfun has a fixed graduation threshold of ~85 SOL
        };
    }
    convertCompleteEvent(evt, platform) {
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            launchpad: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            platform,
            type: 'COMPLETE',
            timestamp: Number(evt.timestamp),
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            poolAddress: evt.bondingCurve,
        };
    }
    convertMigrateEvent(evt, platform) {
        return {
            protocol: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            launchpad: constants_1.DEX_PROGRAMS.PUMP_FUN.name,
            platform,
            type: 'MIGRATE',
            timestamp: Number(evt.timestamp),
            user: evt.user,
            baseMint: evt.mint,
            quoteMint: constants_1.TOKENS.SOL,
            poolAddress: evt.bondingCurve,
            pool: evt.pool,
            poolDex: constants_1.DEX_PROGRAMS.PUMP_SWAP.name,
            // Migration amounts
            migratedTokenAmount: Number(evt.mintAmount),
            migratedSolAmount: Number(evt.solAmount),
            migrationFee: Number(evt.poolMigrateFee),
        };
    }
}
exports.PumpfunEventParser = PumpfunEventParser;
//# sourceMappingURL=parser-pumpfun-event.js.map