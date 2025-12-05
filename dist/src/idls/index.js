"use strict";
/**
 * IDL exports for Solana program decoders
 *
 * These IDLs are sourced from https://github.com/bitquery/solana-idl-lib
 * and used by @coral-xyz/anchor BorshCoder for type-safe instruction decoding.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeteoraDbcIdl = exports.PumpswapIdl = exports.PumpfunIdl = void 0;
const pumpfun_json_1 = __importDefault(require("./pumpfun.json"));
exports.PumpfunIdl = pumpfun_json_1.default;
const pumpswap_json_1 = __importDefault(require("./pumpswap.json"));
exports.PumpswapIdl = pumpswap_json_1.default;
const meteora_dbc_json_1 = __importDefault(require("./meteora-dbc.json"));
exports.MeteoraDbcIdl = meteora_dbc_json_1.default;
//# sourceMappingURL=index.js.map