import { CurveParams, MintParams, RaydiumLCPCreateEvent, VestingParams } from '../../../types';
export declare class PoolCreateEventLayout {
    poolState: Uint8Array;
    creator: Uint8Array;
    config: Uint8Array;
    baseMintParam: MintParams;
    curveParam: CurveParams;
    vestingParam: VestingParams;
    constructor(fields: {
        poolState: Uint8Array;
        creator: Uint8Array;
        config: Uint8Array;
        baseMintParam: MintParams;
        curveParam: CurveParams;
        vestingParam: VestingParams;
    });
    static deserialize(data: Buffer): PoolCreateEventLayout;
    toObject(): RaydiumLCPCreateEvent;
}
