"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoders_1 = require("../decoders");
// First inner instruction data from the create_config transaction
const dataHex = '6433e056336a9125b3c0bcaecfb7e42e32b15619cc8e1d61479a2102a98336d0680cf4e075ce9b9d2ee85e0aa7bcb75d7a25d73ea921bf8b734ac6c704c12b4d69a6589009dd0698b6f490b1fe66d9d6403301b1f754a668f3f38185e2d5e4b02c67cf7eff420fa9b85f54d481cba18de67a110a065a1f3d04b8e4ac3ef96173c39a49042db9a3927dc3a2ca398e2c5ce9f83253c64a184eac460271a2804f54b6436aac580e2a37a499eb57705973bbe1d6aa1ee4ca8216e7e69aba1ba91377b9f553af13c499872f1ec7c9c0c5cd8c6bd5e6ca670642d00192456ea1b2c8f80d70c26a88536259e6d1666be07729dc6cb892bd9930072c803600ed70d84c13df0c9e630b9b93d4accba281cc93bd8a552f15b6261c0746fca0a461ac664c9c863f1354112cc1fe1c7e90520647d628ac9f62f28644440905570c649e908ec2b5d5375e88228f11463d6845d04ed0c243a86b2a2c859f0b71c97c524438f1e975e981';
const data = Buffer.from(dataHex, 'hex');
console.log('Data length:', data.length);
console.log('First 8 bytes:', data.subarray(0, 8).toString('hex'));
// Check create_config discriminator
const createConfigDisc = decoders_1.meteoraDBCDecoder.getInstructionDiscriminator('create_config');
console.log('create_config instr disc:', createConfigDisc?.toString('hex'));
// Check all instruction discriminators
const allDiscs = decoders_1.meteoraDBCDecoder.getAllInstructionDiscriminators();
for (const [name, disc] of allDiscs) {
    if (data.subarray(0, 8).equals(disc)) {
        console.log('MATCHED:', name);
    }
}
console.log('---');
console.log('Total instruction discriminators:', allDiscs.size);
// List first few that might be relevant
const instrList = Array.from(allDiscs.entries());
console.log('\nAll create/config related:');
for (const [name, disc] of instrList) {
    if (name.includes('create') || name.includes('config')) {
        console.log(' -', name, ':', disc.toString('hex'));
    }
}
//# sourceMappingURL=check-disc.js.map