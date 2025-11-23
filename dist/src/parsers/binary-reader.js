"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryReader = void 0;
const bs58_1 = __importDefault(require("bs58"));
class BinaryReader {
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }
    readFixedArray(length) {
        this.checkBounds(length);
        const array = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return array;
    }
    readU8() {
        this.checkBounds(1);
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }
    readU16() {
        this.checkBounds(2);
        const value = this.buffer.readUint16LE(this.offset);
        this.offset += 2;
        return value;
    }
    readU64() {
        this.checkBounds(8);
        const value = this.buffer.readBigUInt64LE(this.offset);
        this.offset += 8;
        return value;
    }
    readI64() {
        this.checkBounds(8);
        const value = this.buffer.readBigInt64LE(this.offset);
        this.offset += 8;
        return value;
    }
    readString() {
        // Read 4-byte (32-bit) length instead of 1 byte
        const length = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        this.checkBounds(length);
        const strBuffer = this.buffer.slice(this.offset, this.offset + length);
        const content = strBuffer.toString('utf8');
        this.offset += length;
        return content;
    }
    readPubkey() {
        return bs58_1.default.encode(Buffer.from(this.readFixedArray(32)));
    }
    remaining() {
        return this.buffer.length - this.offset;
    }
    checkBounds(length) {
        if (this.offset + length > this.buffer.length) {
            throw new Error(`Buffer overflow: trying to read ${length} bytes at offset ${this.offset} in buffer of length ${this.buffer.length}`);
        }
    }
    getOffset() {
        return this.offset;
    }
}
exports.BinaryReader = BinaryReader;
//# sourceMappingURL=binary-reader.js.map