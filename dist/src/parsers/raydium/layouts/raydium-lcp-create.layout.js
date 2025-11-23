"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolCreateEventLayout = void 0;
const bs58_1 = __importDefault(require("bs58"));
const types_1 = require("../../../types");
const binary_reader_1 = require("../../binary-reader");
// PoolCreateEventLayout
class PoolCreateEventLayout {
    constructor(fields) {
        this.poolState = fields.poolState;
        this.creator = fields.creator;
        this.config = fields.config;
        this.baseMintParam = fields.baseMintParam;
        this.curveParam = fields.curveParam;
        this.vestingParam = fields.vestingParam;
    }
    // Deserialize with BinaryReader
    static deserialize(data) {
        const reader = new binary_reader_1.BinaryReader(data);
        // Read fields
        const poolState = reader.readFixedArray(32);
        const creator = reader.readFixedArray(32);
        const config = reader.readFixedArray(32);
        // Read baseMintParam
        const baseMintParam = {
            decimals: reader.readU8(),
            name: reader.readString(),
            symbol: reader.readString(),
            uri: reader.readString(),
        };
        // Read curveParam
        const variant = reader.readU8();
        let curveParam;
        try {
            if (variant === types_1.CurveType.Constant) {
                const data = {
                    supply: reader.readU64(),
                    totalBaseSell: reader.readU64(),
                    totalQuoteFundRaising: reader.readU64(),
                    migrateType: reader.readU8(),
                };
                curveParam = { variant: 'Constant', data };
            }
            else if (variant === types_1.CurveType.Fixed) {
                const data = {
                    supply: reader.readU64(),
                    totalQuoteFundRaising: reader.readU64(),
                    migrateType: reader.readU8(),
                };
                curveParam = { variant: 'Fixed', data };
            }
            else if (variant === types_1.CurveType.Linear) {
                const data = {
                    supply: reader.readU64(),
                    totalQuoteFundRaising: reader.readU64(),
                    migrateType: reader.readU8(),
                };
                curveParam = { variant: 'Linear', data };
            }
            else {
                throw new Error(`Unknown CurveParams variant: ${variant}`);
            }
        }
        catch (error) {
            console.error(`Failed to decode CurveParams at offset ${reader.getOffset()}:`, error);
            throw error;
        }
        // Read vestingParam
        const vestingParam = {
            totalLockedAmount: reader.readU64(),
            cliffPeriod: reader.readU64(),
            unlockPeriod: reader.readU64(),
        };
        return new PoolCreateEventLayout({
            poolState,
            creator,
            config,
            baseMintParam,
            curveParam,
            vestingParam,
        });
    }
    toObject() {
        return {
            poolState: bs58_1.default.encode(this.poolState),
            creator: bs58_1.default.encode(this.creator),
            config: bs58_1.default.encode(this.config),
            baseMintParam: {
                decimals: this.baseMintParam.decimals,
                name: this.baseMintParam.name,
                symbol: this.baseMintParam.symbol,
                uri: this.baseMintParam.uri,
            },
            curveParam: {
                variant: this.curveParam.variant,
                data: {
                    supply: BigInt(this.curveParam.data.supply),
                    totalBaseSell: 'totalBaseSell' in this.curveParam.data ? BigInt(this.curveParam.data.totalBaseSell) : undefined,
                    totalQuoteFundRaising: BigInt(this.curveParam.data.totalQuoteFundRaising),
                    migrateType: this.curveParam.data.migrateType,
                },
            },
            vestingParam: {
                totalLockedAmount: BigInt(this.vestingParam.totalLockedAmount),
                cliffPeriod: BigInt(this.vestingParam.cliffPeriod),
                unlockPeriod: BigInt(this.vestingParam.unlockPeriod),
            },
            baseMint: '', // Initialize baseMint to an empty string
            quoteMint: '', // Initialize quoteMint to an empty string
        };
    }
}
exports.PoolCreateEventLayout = PoolCreateEventLayout;
//# sourceMappingURL=raydium-lcp-create.layout.js.map