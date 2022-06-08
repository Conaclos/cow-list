//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import test from "oletus"
import { CowList } from "cow-list"

/**
 * Three-way comparison
 * @curried
 * @param v1
 * @param v2
 */
export const int3wayComparison = (v1: number) => (v2: number) => {
    if (v1 < v2) {
        return -1
    } else if (v1 > v2) {
        return 1
    } else {
        return 0
    }
}

/**
 * Copy-on-write sorted list of integers with logarithmic insertions.
 */
export class SortedCowList {
    /**
     * @return empty string
     */
    static empty() {
        return new SortedCowList(CowList.empty())
    }

    protected declare repr: CowList<number>

    private constructor(repr: CowList<number>) {
        this.repr = repr
    }

    get length(): number {
        return this.repr.length
    }

    toArray(): number[] {
        return this.repr.toArray()
    }

    /**
     * @param value integer to insert
     * @return
     */
    inserted(value: number): SortedCowList {
        const repr = this.repr
        // Logarithmically search the index of insertion in the list
        const it = repr.atEqual(int3wayComparison(value), false)
        // Apply operations and return a new rope
        return new SortedCowList(repr.inserted(it.index, value))
    }
}

test("sorted-cow-list-empty", (t) => {
    const l = SortedCowList.empty()

    t.deepEqual(l.length, 0)
    t.deepEqual(l.toArray().length, 0)
})

test("sorted-cow-list-insertions", (t) => {
    const l1 = SortedCowList.empty()
    const l2 = l1
        .inserted(5)
        .inserted(2)
        .inserted(8)
        .inserted(4)
        .inserted(7)
        .inserted(5)

    t.deepEqual(l2.length, 6)
    t.deepEqual(l2.toArray(), [2, 4, 5, 5, 7, 8])
})
