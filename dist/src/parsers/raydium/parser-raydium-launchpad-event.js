"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaydiumLaunchpadEventParser = void 0;
const buffer_1 = require("buffer");
const constants_1 = require("../../constants");
const decoders_1 = require("../../decoders");
const instruction_classifier_1 = require("../../instruction-classifier");
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const raydium_lcp_create_layout_1 = require("./layouts/raydium-lcp-create.layout");
class RaydiumLaunchpadEventParser {
    constructor(adapter, transferActions) {
        this.adapter = adapter;
        this.transferActions = transferActions;
        this.EventsParsers = {
            CREATE: {
                discriminators: [],
                slice: 16,
                decode: this.decodeCreateEvent.bind(this),
            },
            TRADE: {
                discriminators: [],
                slice: 8,
                decode: this.decodeTradeInstruction.bind(this),
            },
            COMPLETE: {
                discriminators: [],
                slice: 8,
                decode: this.decodeCompleteInstruction.bind(this),
            },
        };
        this.initializeDiscriminators();
    }
    // Get discriminators from the IDL decoder
    getDiscriminators() {
        return {
            // Event discriminator (16 bytes = anchor prefix + event discriminator)
            createEvent: this.getEventDiscriminator('PoolCreateEvent'),
            // Instruction discriminators (8 bytes)
            buyExactIn: decoders_1.raydiumLaunchpadDecoder.getInstructionDiscriminator('buy_exact_in'),
            buyExactOut: decoders_1.raydiumLaunchpadDecoder.getInstructionDiscriminator('buy_exact_out'),
            sellExactIn: decoders_1.raydiumLaunchpadDecoder.getInstructionDiscriminator('sell_exact_in'),
            sellExactOut: decoders_1.raydiumLaunchpadDecoder.getInstructionDiscriminator('sell_exact_out'),
            migrateToAmm: decoders_1.raydiumLaunchpadDecoder.getInstructionDiscriminator('migrate_to_amm'),
            migrateToCpswap: decoders_1.raydiumLaunchpadDecoder.getInstructionDiscriminator('migrate_to_cpswap'),
        };
    }
    // Get full event discriminator (anchor prefix + event disc)
    getEventDiscriminator(eventName) {
        const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
        const eventDisc = decoders_1.raydiumLaunchpadDecoder.getEventDiscriminator(eventName);
        if (!eventDisc)
            return undefined;
        return buffer_1.Buffer.concat([ANCHOR_EVENT_PREFIX, eventDisc]);
    }
    initializeDiscriminators() {
        const discs = this.getDiscriminators();
        if (discs.createEvent)
            this.EventsParsers.CREATE.discriminators.push(discs.createEvent);
        if (discs.buyExactIn)
            this.EventsParsers.TRADE.discriminators.push(discs.buyExactIn);
        if (discs.buyExactOut)
            this.EventsParsers.TRADE.discriminators.push(discs.buyExactOut);
        if (discs.sellExactIn)
            this.EventsParsers.TRADE.discriminators.push(discs.sellExactIn);
        if (discs.sellExactOut)
            this.EventsParsers.TRADE.discriminators.push(discs.sellExactOut);
        if (discs.migrateToAmm) {
            this.EventsParsers.COMPLETE.discriminators.push(discs.migrateToAmm);
            this.migrateToAmmDisc = discs.migrateToAmm;
        }
        if (discs.migrateToCpswap) {
            this.EventsParsers.COMPLETE.discriminators.push(discs.migrateToCpswap);
            this.migrateToCpswapDisc = discs.migrateToCpswap;
        }
    }
    processEvents() {
        const instructions = new instruction_classifier_1.InstructionClassifier(this.adapter).getInstructions(constants_1.DEX_PROGRAMS.RAYDIUM_LCP.id);
        return this.parseInstructions(instructions);
    }
    parseInstructions(instructions) {
        return (0, utils_1.sortByIdx)(instructions
            .map(({ instruction, outerIndex, innerIndex }) => {
            try {
                const data = (0, utils_1.getInstructionData)(instruction);
                for (const [type, parser] of Object.entries(this.EventsParsers)) {
                    const discriminator = buffer_1.Buffer.from(data.slice(0, parser.slice));
                    if (parser.discriminators.some((it) => discriminator.equals(it))) {
                        const options = {
                            instruction,
                            outerIndex,
                            innerIndex,
                        };
                        const memeEvent = parser.decode(data, options);
                        if (!memeEvent)
                            return null;
                        memeEvent.signature = this.adapter.signature;
                        memeEvent.slot = this.adapter.slot;
                        memeEvent.timestamp = this.adapter.blockTime;
                        memeEvent.idx = `${outerIndex}-${innerIndex ?? 0}`;
                        return memeEvent;
                    }
                }
            }
            catch (error) {
                console.error('Failed to parse RaydiumLCP event:', error);
                throw error;
            }
            return null;
        })
            .filter((event) => event !== null));
    }
    decodeTradeInstruction(data, options) {
        // Find the TradeEvent CPI that follows the trade instruction
        // Case 1: Outer instruction (direct call) - TradeEvent is at innerIndex 0
        // Case 2: Inner instruction (via router) - TradeEvent is the next inner instruction
        let eventInstruction;
        if (options.innerIndex === undefined) {
            // Case 1: Direct call - TradeEvent is the first inner instruction
            eventInstruction = this.adapter.getInnerInstruction(options.outerIndex, 0);
        }
        else {
            // Case 2: Via router - TradeEvent follows the trade instruction
            // The TradeEvent should be the next inner instruction after the trade
            eventInstruction = this.adapter.getInnerInstruction(options.outerIndex, options.innerIndex + 1);
        }
        if (!eventInstruction) {
            // No TradeEvent found - this might be a CPI event itself, skip it
            return null;
        }
        // Verify this is actually a TradeEvent (has Anchor event prefix)
        const eventData = (0, utils_1.getInstructionData)(eventInstruction);
        const ANCHOR_EVENT_PREFIX = buffer_1.Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
        if (eventData.length < 16 || !buffer_1.Buffer.from(eventData.slice(0, 8)).equals(ANCHOR_EVENT_PREFIX)) {
            return null; // Not an Anchor event
        }
        // Use IDL decoder to parse the TradeEvent from inner instruction
        // The event data has 16-byte prefix (8 byte Anchor prefix + 8 byte event discriminator)
        const decoded = decoders_1.raydiumLaunchpadDecoder.parseTradeEventDirect(buffer_1.Buffer.from(eventData).subarray(16));
        if (!decoded) {
            throw new Error('Failed to decode TradeEvent with IDL decoder');
        }
        // Get instruction accounts for user and mints
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const user = accounts[0];
        const baseMint = accounts[9];
        const quoteMint = accounts[10];
        // Detect launchpad platform from platformConfig (accounts[3])
        const platformConfig = accounts[3];
        const platform = constants_1.RAYDIUM_LCP_LAUNCHPAD_CONFIGS[platformConfig] || 'Raydium Launchlab';
        let inputMint, outputMint;
        let inputAmount, outputAmount;
        let inputDecimals, outputDecimals;
        if (decoded.tradeDirection === 0) {
            inputMint = quoteMint;
            inputAmount = decoded.amountIn;
            inputDecimals = 9;
            outputMint = baseMint;
            outputAmount = decoded.amountOut;
            outputDecimals = 6;
        }
        else {
            inputMint = baseMint;
            inputAmount = decoded.amountIn;
            inputDecimals = 6;
            outputMint = quoteMint;
            outputAmount = decoded.amountOut;
            outputDecimals = 9;
        }
        // Calculate DYNAMIC virtual reserves using Constant Product formula (k = x * y)
        // Raydium emits INITIAL/STATIC values in virtualBase/virtualQuote from the pool's curve config
        // These values vary by pool configuration (standard: 30 SOL offset, custom pools may differ)
        // We calculate current virtual state based on real reserves accumulated
        const initialVirtualToken = decoded.virtualBase; // x0 (initial virtual token reserve from pool config)
        const initialVirtualSol = decoded.virtualQuote; // y0 (initial virtual SOL reserve from pool config)
        const currentRealSol = decoded.realQuoteAfter; // SOL accumulated in bonding curve (updated per trade)
        let currentVirtualSol = initialVirtualSol;
        let currentVirtualToken = initialVirtualToken;
        if (initialVirtualSol && initialVirtualToken && currentRealSol !== undefined) {
            // k = x * y (constant product invariant)
            const k = initialVirtualToken * initialVirtualSol;
            // New virtual SOL = initial virtual SOL + real SOL accumulated
            currentVirtualSol = initialVirtualSol + currentRealSol;
            // New virtual token = k / new virtual SOL (maintaining constant product)
            currentVirtualToken = k / currentVirtualSol;
        }
        return {
            protocol: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            launchpad: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            platform,
            type: decoded.tradeDirection === 0 ? 'BUY' : 'SELL',
            poolAddress: decoded.poolState,
            baseMint: baseMint,
            quoteMint: quoteMint,
            user: user,
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
            fee: Number(decoded.protocolFee),
            platformFee: Number(decoded.platformFee),
            shareFee: Number(decoded.shareFee),
            creatorFee: Number(decoded.creatorFee),
            // Bonding curve reserves (Curve/Vault nomenclature)
            curveBaseReserves: currentVirtualToken !== undefined ? Number(currentVirtualToken) : undefined,
            curveQuoteReserves: currentVirtualSol !== undefined ? Number(currentVirtualSol) : undefined,
            // Real reserves: vaultBaseReserves is INVENTORY (tokens available to buy)
            // Raydium's realBaseAfter = tokens sold/transferred OUT, so inventory = totalBaseSell - realBaseAfter
            vaultBaseReserves: decoded.totalBaseSell !== undefined && decoded.realBaseAfter !== undefined
                ? Number(decoded.totalBaseSell - decoded.realBaseAfter)
                : undefined,
            // vaultQuoteReserves is SOL accumulated in the pool (Raydium's realQuoteAfter)
            vaultQuoteReserves: decoded.realQuoteAfter !== undefined ? Number(decoded.realQuoteAfter) : undefined,
        };
    }
    decodeCreateEvent(data, options) {
        const eventInstruction = this.adapter.instructions[options.outerIndex]; // find outer instruction
        if (!eventInstruction) {
            throw new Error('Event instruction not found');
        }
        // parse event data
        const eventData = data.slice(16);
        const evt = raydium_lcp_create_layout_1.PoolCreateEventLayout.deserialize(eventData).toObject();
        // get instruction accounts
        const accounts = this.adapter.getInstructionAccounts(eventInstruction);
        evt.baseMint = accounts[6];
        evt.quoteMint = accounts[7];
        // Platform config is at accounts[3] (not evt.config which is pool config)
        // accounts[2] = pool config, accounts[3] = platform config (launchpad identifier)
        const platformConfig = accounts[3];
        const platform = constants_1.RAYDIUM_LCP_LAUNCHPAD_CONFIGS[platformConfig] || 'Raydium Launchlab';
        // Extract curve parameters for bonding curve info
        const curveData = evt.curveParam?.data;
        const tokenTotalSupply = curveData?.supply ? Number(curveData.supply) : undefined;
        const graduationThreshold = curveData?.totalQuoteFundRaising ? Number(curveData.totalQuoteFundRaising) : undefined;
        const initialSaleSupply = curveData?.totalBaseSell ? Number(curveData.totalBaseSell) : undefined;
        // Calculate initial virtual reserves based on curve parameters
        // Using Raydium's getInitParam formula from constantProductCurve.ts
        let curveBaseReserves;
        let curveQuoteReserves;
        if (curveData && tokenTotalSupply && graduationThreshold && initialSaleSupply) {
            const supply = BigInt(tokenTotalSupply);
            const totalSell = BigInt(initialSaleSupply);
            const totalFundRaising = BigInt(graduationThreshold);
            const totalLockedAmount = curveData.totalLockedAmount ? BigInt(curveData.totalLockedAmount) : 0n;
            const migrateFee = 0n;
            const supplyMinusSellLocked = supply - totalSell - totalLockedAmount;
            const tfMinusMf = totalFundRaising - migrateFee;
            if (supplyMinusSellLocked > 0n && tfMinusMf > 0n) {
                const denominator = (tfMinusMf * totalSell / supplyMinusSellLocked) - totalFundRaising;
                if (denominator !== 0n) {
                    const numerator = tfMinusMf * totalSell * totalSell / supplyMinusSellLocked;
                    curveBaseReserves = Number(numerator / denominator);
                    curveQuoteReserves = Number(totalFundRaising * totalFundRaising / denominator);
                }
                else {
                    curveBaseReserves = Number(supply);
                    curveQuoteReserves = Number(totalFundRaising);
                }
            }
            else {
                curveBaseReserves = Number(supply);
                curveQuoteReserves = Number(totalFundRaising);
            }
        }
        else {
            // Fallback to defaults if curve params are missing
            const INITIAL_VIRTUAL_SOL = 30000000000;
            const INITIAL_VIRTUAL_TOKENS_6_DECIMALS = 1073000000000000;
            const INITIAL_VIRTUAL_TOKENS_9_DECIMALS = 1073000000000000000;
            curveQuoteReserves = INITIAL_VIRTUAL_SOL;
            curveBaseReserves = evt.baseMintParam.decimals === 6
                ? INITIAL_VIRTUAL_TOKENS_6_DECIMALS
                : INITIAL_VIRTUAL_TOKENS_9_DECIMALS;
        }
        // SPL Token program (default for Raydium Launchpad)
        const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        return {
            protocol: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            launchpad: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            platform,
            type: 'CREATE',
            timestamp: this.adapter.blockTime,
            user: evt.creator,
            // Grouped token structures for CREATE events
            baseToken: {
                mint: evt.baseMint,
                name: evt.baseMintParam.name,
                symbol: evt.baseMintParam.symbol,
                uri: evt.baseMintParam.uri,
                decimals: evt.baseMintParam.decimals,
                totalSupply: tokenTotalSupply || 0,
                programId: SPL_TOKEN_PROGRAM,
            },
            quoteToken: {
                mint: evt.quoteMint,
                symbol: evt.quoteMint === constants_1.TOKENS.SOL ? 'SOL' : 'QUOTE',
                decimals: 9,
            },
            creatorAddress: evt.creator,
            poolAddress: evt.poolState,
            configAddress: platformConfig,
            // Bonding curve reserves (Curve/Vault nomenclature)
            curveType: 'ConstantProduct', // Raydium uses constant product AMM (x * y = k)
            curveBaseReserves,
            curveQuoteReserves,
            vaultBaseReserves: initialSaleSupply || 0, // Inventory available to buy
            vaultQuoteReserves: 0, // Initial SOL collected = 0
            // Goals
            initialSaleSupply: initialSaleSupply || 0,
            graduationThreshold: graduationThreshold || 0,
        };
    }
    decodeCompleteInstruction(data, options) {
        const discriminator = buffer_1.Buffer.from(data.slice(0, 8));
        const accounts = this.adapter.getInstructionAccounts(options.instruction);
        const isMigrateToAmm = this.migrateToAmmDisc && discriminator.equals(this.migrateToAmmDisc);
        const [baseMint, quoteMint, poolMint, lpMint] = isMigrateToAmm
            ? [accounts[1], accounts[2], accounts[13], accounts[16]]
            : [accounts[1], accounts[2], accounts[5], accounts[7]];
        const amm = isMigrateToAmm
            ? constants_1.DEX_PROGRAMS.RAYDIUM_V4.name
            : constants_1.DEX_PROGRAMS.RAYDIUM_CPMM.name;
        // For MIGRATE, we don't have platformConfig in accounts - default to Raydium Launchlab
        return {
            protocol: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            launchpad: constants_1.DEX_PROGRAMS.RAYDIUM_LCP.name,
            platform: 'Raydium Launchlab',
            type: 'MIGRATE',
            timestamp: this.adapter.blockTime,
            baseMint: baseMint,
            quoteMint: quoteMint,
            pool: poolMint,
            poolDex: amm
        };
    }
}
exports.RaydiumLaunchpadEventParser = RaydiumLaunchpadEventParser;
//# sourceMappingURL=parser-raydium-launchpad-event.js.map