import type { fract32, u32 } from "../../src/util/number.js"

export const asU32Between = (l: u32, excludedU: u32, prand: fract32): u32 =>
    (((prand * (excludedU - l)) >>> 0) + l) >>> 0
