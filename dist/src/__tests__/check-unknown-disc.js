"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decoders_1 = require("../decoders");
// Unknown discriminator
const unknownDisc = Buffer.from('6433e056336a9125', 'hex');
console.log('Unknown disc:', unknownDisc.toString('hex'));
console.log('As array:', Array.from(unknownDisc));
// Check all instruction discriminators
const allInstrDiscs = decoders_1.meteoraDBCDecoder.getAllInstructionDiscriminators();
console.log('\n=== All instruction discriminators ===');
for (const [name, disc] of allInstrDiscs) {
    console.log(name.padEnd(45), disc.toString('hex'));
}
// Check all event discriminators
const allEventDiscs = decoders_1.meteoraDBCDecoder.getAllEventDiscriminators();
console.log('\n=== All event discriminators ===');
for (const [name, disc] of allEventDiscs) {
    console.log(name.padEnd(45), disc.toString('hex'));
}
// Check if 6433e056336a9125 is in any list
console.log('\n=== Searching for 6433e056336a9125 ===');
for (const [name, disc] of allInstrDiscs) {
    if (disc.toString('hex') === '6433e056336a9125') {
        console.log('Found in instructions:', name);
    }
}
for (const [name, disc] of allEventDiscs) {
    if (disc.toString('hex') === '6433e056336a9125') {
        console.log('Found in events:', name);
    }
}
//# sourceMappingURL=check-unknown-disc.js.map