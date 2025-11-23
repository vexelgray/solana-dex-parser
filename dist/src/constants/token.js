"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKEN_DECIMALS = exports.TOKENS = void 0;
// Known token addresses
exports.TOKENS = {
    NATIVE: '11111111111111111111111111111111',
    SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    USD1: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
    USDG: "2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH",
    PYUSD: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    EURC: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
    USDY: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
    FDUSD: "9zNQRsGLjNKwCUU5Gq5LR8beUCPzQMVMqKAi3SSZh54u"
};
exports.TOKEN_DECIMALS = {
    [exports.TOKENS.SOL]: 9,
    [exports.TOKENS.USDC]: 6,
    [exports.TOKENS.USDT]: 6,
    [exports.TOKENS.USD1]: 6,
    [exports.TOKENS.USDG]: 6,
    [exports.TOKENS.PYUSD]: 6,
    [exports.TOKENS.EURC]: 6,
    [exports.TOKENS.USDY]: 6,
    [exports.TOKENS.FDUSD]: 6,
};
//# sourceMappingURL=token.js.map