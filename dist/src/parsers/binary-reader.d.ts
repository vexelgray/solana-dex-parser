export declare class BinaryReader {
    private buffer;
    private offset;
    constructor(buffer: Buffer);
    readFixedArray(length: number): Buffer;
    readU8(): number;
    readU16(): number;
    readU64(): bigint;
    readI64(): bigint;
    readString(): string;
    readPubkey(): string;
    remaining(): number;
    private checkBounds;
    getOffset(): number;
}
