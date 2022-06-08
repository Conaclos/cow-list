//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import test from "oletus"
import { CowList, type ListOp, ins, sub } from "cow-list"

/**
 * String with logarithmic insertions.
 */
export class CowRope {
    /**
     * @return empty string
     */
    static empty() {
        return new CowRope(CowList.empty())
    }

    protected declare repr: CowList<string>

    private constructor(repr: CowList<string>) {
        this.repr = repr
    }

    get length(): number {
        return this.repr.summary
    }

    toString(): string {
        return this.repr.reduce((acc, v) => acc + v, "")
    }

    /**
     * @param index index of insertion in the string
     * @param str value to insert
     * @return nex string
     */
    inserted(index: number, str: string): CowRope {
        const repr = this.repr
        // Logarithmically search the index of insertion in the list
        const it = repr.atEqual((v, summary) => {
            if (index < summary) {
                return -1
            } else if (index > summary + v.length) {
                return 1
            } else {
                return 0
            }
        }, false)
        // Build the sequence of operations to perform on the list
        let ops: ListOp<string>[]
        const value = it.value
        if (value === undefined) {
            ops = [ins(it.index, str)]
        } else if (index === it.summary + value.length) {
            ops = [ins(it.index + 1, str)]
        } else if (index === it.summary) {
            ops = [ins(it.index, str)]
        } else {
            const splitOffset = index - it.summary
            const lValue = value.slice(0, splitOffset)
            const rValue = value.slice(splitOffset)
            ops = [
                sub(it.index, rValue),
                ins(it.index, str),
                ins(it.index, lValue),
            ]
        }
        // Apply operations and return a new rope
        return new CowRope(repr.applied(ops))
    }
}

test("cow-rope-empty", (t) => {
    const r = CowRope.empty()

    t.deepEqual(r.length, 0)
    t.deepEqual(r.toString(), "")
})

test("cow-rope-insertions", (t) => {
    const r1 = CowRope.empty()
    const r2 = r1.inserted(0, "cd")
    const r3 = r2.inserted(2, "gh")
    const r4 = r3.inserted(2, "ef")
    const r5 = r4.inserted(0, "ab")
    const r6 = r5.inserted(8, "ij")

    t.deepEqual(r2.length, 2)
    t.deepEqual(r2.toString(), "cd")
    t.deepEqual(r3.length, 4)
    t.deepEqual(r3.toString(), "cdgh")
    t.deepEqual(r4.length, 6)
    t.deepEqual(r4.toString(), "cdefgh")
    t.deepEqual(r5.length, 8)
    t.deepEqual(r5.toString(), "abcdefgh")
    t.deepEqual(r6.length, 10)
    t.deepEqual(r6.toString(), "abcdefghij")
})

test("cow-rope-split", (t) => {
    const r1 = CowRope.empty()
    const r2 = r1.inserted(0, "abef")
    const r3 = r2.inserted(2, "cd")

    t.deepEqual(r3.length, 6)
    t.deepEqual(r3.toString(), "abcdef")
})
