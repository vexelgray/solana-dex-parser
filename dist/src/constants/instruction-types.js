"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_INSTRUCTION_TYPES = exports.SPL_TOKEN_INSTRUCTION_TYPES = void 0;
exports.SPL_TOKEN_INSTRUCTION_TYPES = {
    InitializeMint: 0,
    InitializeAccount: 1,
    InitializeMultisig: 2,
    Transfer: 3,
    Approve: 4,
    Revoke: 5,
    SetAuthority: 6,
    MintTo: 7,
    Burn: 8,
    CloseAccount: 9,
    FreezeAccount: 10,
    ThawAccount: 11,
    TransferChecked: 12,
    ApproveChecked: 13,
    MintToChecked: 14,
    BurnChecked: 15,
};
exports.SYSTEM_INSTRUCTION_TYPES = {
    CreateAccount: 0,
    Assign: 1,
    Transfer: 2,
    CreateAccountWithSeed: 3,
    AdvanceNonceAccount: 4,
    WithdrawNonceAccount: 5,
    InitializeNonceAccount: 6,
    AuthorizeNonceAccount: 7,
    Allocate: 8,
    AllocateWithSeed: 9,
    AssignWithSeed: 10,
    TransferWithSeed: 11,
    UpgradeNonceAccount: 12,
    CreateAccountWithSeedChecked: 13,
    CreateIdempotent: 14,
};
//# sourceMappingURL=instruction-types.js.map