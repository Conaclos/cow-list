import type { u32 } from "../util/number.js"

export interface Lengthy {
    readonly length?: u32 | undefined
}

/**
 * @param x
 * @return length of {@code x} or 1 if none.
 */
export const lengthOf = (x: Lengthy): u32 =>
    x.length !== undefined ? x.length : 1
