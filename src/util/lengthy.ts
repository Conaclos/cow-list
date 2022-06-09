//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import type { u32 } from "./number.js"

export interface Lengthy {
    readonly length?: unknown
}

/**
 * @param x
 * @return length of {@code x} or 1 if none.
 */
export function lengthOf(x: Lengthy): u32 {
    if (typeof x === "string") {
        return x.length
    } else if (typeof x === "object" && x !== null) {
        if (Array.isArray(x)) {
            return x.length
        } else if (typeof x.length === "number") {
            return x.length
        }
    }
    return 1
}
