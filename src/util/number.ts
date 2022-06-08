//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

export type fract32 = number

export type u32 = number

export function asU32Between(l: u32, excludedU: u32, prand: fract32): u32 {
    return (((prand * (excludedU - l)) >>> 0) + l) >>> 0
}
