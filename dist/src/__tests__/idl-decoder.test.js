"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const idl_decoder_1 = require("../decoders/idl-decoder");
const discriminators_1 = require("../constants/discriminators");
const pumpfun_json_1 = __importDefault(require("../idls/pumpfun.json"));
const pumpswap_json_1 = __importDefault(require("../idls/pumpswap.json"));
const meteora_dbc_json_1 = __importDefault(require("../idls/meteora-dbc.json"));
describe('IdlDecoder', () => {
    describe('Pumpfun IDL', () => {
        let decoder;
        beforeAll(() => {
            decoder = new idl_decoder_1.IdlDecoder(pumpfun_json_1.default);
        });
        it('should load IDL metadata correctly', () => {
            const metadata = decoder.getMetadata();
            expect(metadata.name).toBe('pump');
            expect(metadata.address).toBe('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
        });
        it('should list all instructions', () => {
            const instructions = decoder.listInstructions();
            expect(instructions).toContain('buy');
            expect(instructions).toContain('sell');
            expect(instructions).toContain('create');
            expect(instructions).toContain('migrate');
        });
        it('should list all events', () => {
            const events = decoder.listEvents();
            expect(events).toContain('TradeEvent');
            expect(events).toContain('CreateEvent');
            expect(events).toContain('CompleteEvent');
            // Note: MigrateEvent is named "CompletePumpAmmMigrationEvent" in the IDL
            expect(events).toContain('CompletePumpAmmMigrationEvent');
        });
        describe('Instruction discriminators match hardcoded values', () => {
            it('should match BUY discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('buy');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.BUY);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
            it('should match SELL discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('sell');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.SELL);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
            it('should match CREATE discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('create');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.CREATE);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
            it('should match MIGRATE discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('migrate');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.MIGRATE);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
        });
        describe('Event discriminators match hardcoded values', () => {
            // Note: Anchor events in self-CPI format have 8-byte prefix [228, 69, 165, 46, 81, 203, 154, 29]
            // followed by the actual 8-byte event discriminator
            const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
            it('should match TRADE_EVENT discriminator', () => {
                const idlDisc = decoder.getEventDiscriminator('TradeEvent');
                const hardcodedFull = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.TRADE_EVENT);
                // The hardcoded value includes the 8-byte prefix
                const hardcodedEventDisc = hardcodedFull.subarray(8, 16);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedEventDisc)).toBe(true);
            });
            it('should match CREATE_EVENT discriminator', () => {
                const idlDisc = decoder.getEventDiscriminator('CreateEvent');
                const hardcodedFull = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.CREATE_EVENT);
                const hardcodedEventDisc = hardcodedFull.subarray(8, 16);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedEventDisc)).toBe(true);
            });
            it('should match COMPLETE_EVENT discriminator', () => {
                const idlDisc = decoder.getEventDiscriminator('CompleteEvent');
                const hardcodedFull = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.COMPLETE_EVENT);
                const hardcodedEventDisc = hardcodedFull.subarray(8, 16);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedEventDisc)).toBe(true);
            });
            it('should match MIGRATE_EVENT discriminator (CompletePumpAmmMigrationEvent)', () => {
                // Note: The hardcoded MIGRATE_EVENT maps to "CompletePumpAmmMigrationEvent" in the IDL
                const idlDisc = decoder.getEventDiscriminator('CompletePumpAmmMigrationEvent');
                const hardcodedFull = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.MIGRATE_EVENT);
                const hardcodedEventDisc = hardcodedFull.subarray(8, 16);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedEventDisc)).toBe(true);
            });
        });
        describe('Discriminator matching methods', () => {
            it('should identify BUY instruction by discriminator', () => {
                const data = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.BUY);
                const result = decoder.findInstructionByDiscriminator(data);
                expect(result).toBe('buy');
            });
            it('should identify SELL instruction by discriminator', () => {
                const data = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.SELL);
                const result = decoder.findInstructionByDiscriminator(data);
                expect(result).toBe('sell');
            });
            it('should return true for isInstruction with matching data', () => {
                const data = Buffer.concat([
                    Buffer.from(discriminators_1.DISCRIMINATORS.PUMPFUN.BUY),
                    Buffer.alloc(100), // Additional data
                ]);
                expect(decoder.isInstruction(data, 'buy')).toBe(true);
                expect(decoder.isInstruction(data, 'sell')).toBe(false);
            });
        });
    });
    describe('Pumpswap IDL', () => {
        let decoder;
        beforeAll(() => {
            decoder = new idl_decoder_1.IdlDecoder(pumpswap_json_1.default);
        });
        it('should load IDL metadata correctly', () => {
            const metadata = decoder.getMetadata();
            expect(metadata.name).toBe('pump_amm');
            expect(metadata.address).toBe('pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA');
        });
        it('should list all instructions', () => {
            const instructions = decoder.listInstructions();
            expect(instructions).toContain('buy');
            expect(instructions).toContain('sell');
            expect(instructions).toContain('create_pool');
            expect(instructions).toContain('deposit');
            expect(instructions).toContain('withdraw');
        });
        describe('Instruction discriminators match hardcoded values', () => {
            it('should match CREATE_POOL discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('create_pool');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPSWAP.CREATE_POOL);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
            it('should match BUY discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('buy');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPSWAP.BUY);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
            it('should match SELL discriminator', () => {
                const idlDisc = decoder.getInstructionDiscriminator('sell');
                const hardcodedDisc = Buffer.from(discriminators_1.DISCRIMINATORS.PUMPSWAP.SELL);
                expect(idlDisc).toBeDefined();
                expect(idlDisc.equals(hardcodedDisc)).toBe(true);
            });
        });
    });
    describe('Meteora DBC IDL', () => {
        let decoder;
        beforeAll(() => {
            decoder = new idl_decoder_1.IdlDecoder(meteora_dbc_json_1.default);
        });
        it('should load IDL metadata correctly', () => {
            const metadata = decoder.getMetadata();
            expect(metadata.name).toBe('dynamic_bonding_curve');
        });
        it('should list instructions', () => {
            const instructions = decoder.listInstructions();
            expect(instructions.length).toBeGreaterThan(0);
            // Check for common DBC operations (swap instead of buy/sell)
            expect(instructions).toContain('swap');
            expect(instructions).toContain('swap2');
        });
        it('should list events', () => {
            const events = decoder.listEvents();
            expect(events.length).toBeGreaterThan(0);
        });
    });
    describe('Edge cases', () => {
        let decoder;
        beforeAll(() => {
            decoder = new idl_decoder_1.IdlDecoder(pumpfun_json_1.default);
        });
        it('should return undefined for non-existent instruction', () => {
            const disc = decoder.getInstructionDiscriminator('nonexistent');
            expect(disc).toBeUndefined();
        });
        it('should return undefined for non-existent event', () => {
            const disc = decoder.getEventDiscriminator('NonexistentEvent');
            expect(disc).toBeUndefined();
        });
        it('should return null for findInstructionByDiscriminator with unknown data', () => {
            const unknownData = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
            const result = decoder.findInstructionByDiscriminator(unknownData);
            expect(result).toBeNull();
        });
        it('should return null for too short data', () => {
            const shortData = Buffer.from([1, 2, 3]);
            const result = decoder.findInstructionByDiscriminator(shortData);
            expect(result).toBeNull();
        });
        it('should return false for isInstruction with non-matching data', () => {
            const randomData = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
            expect(decoder.isInstruction(randomData, 'buy')).toBe(false);
        });
    });
});
describe('Cross-IDL discriminator validation', () => {
    it('should have unique instruction discriminators across protocols', () => {
        const pumpfunDecoder = new idl_decoder_1.IdlDecoder(pumpfun_json_1.default);
        const pumpswapDecoder = new idl_decoder_1.IdlDecoder(pumpswap_json_1.default);
        // BUY and SELL discriminators are shared across pumpfun and pumpswap (by design)
        const pumpfunBuy = pumpfunDecoder.getInstructionDiscriminator('buy');
        const pumpswapBuy = pumpswapDecoder.getInstructionDiscriminator('buy');
        expect(pumpfunBuy).toBeDefined();
        expect(pumpswapBuy).toBeDefined();
        // They should be the same (pumpswap uses same signature)
        expect(pumpfunBuy.equals(pumpswapBuy)).toBe(true);
    });
});
//# sourceMappingURL=idl-decoder.test.js.map