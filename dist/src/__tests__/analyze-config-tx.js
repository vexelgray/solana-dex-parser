"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Analyze the create_config transaction data
const data = Buffer.from('6433e056336a9125b3c0bcaecfb7e42e32b15619cc8e1d61479a2102a98336d0680cf4e075ce9b9d2ee85e0aa7bcb75d7a25d73ea921bf8b734ac6c704c12b4d69a6589009dd0698b6f490b1fe66d9d6403301b1f754a668f3f38185e2d5e4b02c67cf7eff420fa9b85f54d481cba18de67a110a065a1f3d04b8e4ac3ef96173c39a49042db9a3927dc3a2ca398e2c5ce9f83253c64a184eac460271a2804f54b6436aac580e2a37a499eb57705973bbe1d6aa1ee4ca8216e7e69aba1ba91377b9f553af13c499872f1ec7c9c0c5cd8c6bd5e6ca670642d00192456ea1b2c8f80d70c26a88536259e6d1666be07729dc6cb892bd9930072c803600ed70d84c13df0c9e630b9b93d4accba281cc93bd8a552f15b6261c0746fca0a461ac664c9c863f1354112cc1fe1c7e90520647d628ac9f62f28644440905570c649e908ec2b5d5375e88228f11463d6845d04ed0c243a86b2a2c859f0b71c97c524438f1e975e981', 'hex');
// Expected Anchor self-CPI event prefix
const ANCHOR_EVENT_PREFIX = Buffer.from([228, 69, 165, 46, 81, 203, 154, 29]);
console.log('Anchor self-CPI prefix:', ANCHOR_EVENT_PREFIX.toString('hex'));
console.log('First 8 bytes:', data.subarray(0, 8).toString('hex'));
console.log('Matches Anchor prefix?', data.subarray(0, 8).equals(ANCHOR_EVENT_PREFIX));
// EvtCreateConfig discriminators
const EVT_CREATE_CONFIG_V1 = Buffer.from([131, 207, 180, 174, 180, 73, 165, 54]);
const EVT_CREATE_CONFIG_V2 = Buffer.from([163, 74, 66, 187, 119, 195, 26, 144]);
console.log('\nEvtCreateConfig V1 disc:', EVT_CREATE_CONFIG_V1.toString('hex'));
console.log('EvtCreateConfig V2 disc:', EVT_CREATE_CONFIG_V2.toString('hex'));
// The first 8 bytes might be the instruction discriminator, and the event is inside the inner instruction
// Let's search for the event discriminators anywhere in the buffer
const v1Idx = data.indexOf(EVT_CREATE_CONFIG_V1);
const v2Idx = data.indexOf(EVT_CREATE_CONFIG_V2);
console.log('\nV1 discriminator found at index:', v1Idx);
console.log('V2 discriminator found at index:', v2Idx);
// Also search for anchor prefix anywhere
const anchorIdx = data.indexOf(ANCHOR_EVENT_PREFIX);
console.log('Anchor prefix found at index:', anchorIdx);
// Let's also look for create_partner_config instruction discriminator
// since this might be an event from that instruction
const decoders_1 = require("../decoders");
console.log('\n=== Checking all event discriminators ===');
const eventDiscs = decoders_1.meteoraDBCDecoder.getAllEventDiscriminators();
for (const [name, disc] of eventDiscs) {
    const idx = data.indexOf(disc);
    if (idx >= 0) {
        console.log('FOUND event', name, 'at index:', idx);
    }
}
// Show bytes 8-16 (event discriminator position for self-CPI events)
console.log('\nBytes 8-16 (event discriminator position):', data.subarray(8, 16).toString('hex'));
// Let's check if bytes 0-8 are a self-CPI prefix we don't know
console.log('\n=== Analyzing buffer structure ===');
console.log('First 16 bytes (hex):', data.subarray(0, 16).toString('hex'));
console.log('Next 32 bytes (pubkey?):', data.subarray(16, 48).toString('hex'));
//# sourceMappingURL=analyze-config-tx.js.map