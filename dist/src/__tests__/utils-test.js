"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const hex = 
//'c1209b3341d69c810e030000003d016400011a64010234640203402c420600000000e953780100000000500000'; // instruction discriminator 
'005c93a12300000000754d417e257c0100'; // event discriminator
const data = (0, utils_1.hexToUint8Array)(hex);
console.log(data.slice(0, 8)); // instruction discriminator
//# sourceMappingURL=utils-test.js.map