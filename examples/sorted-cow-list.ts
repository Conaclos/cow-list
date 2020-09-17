import { CowList, ins, sub } from "../src/index"
import { u32 } from "../src/util/number"

/**
 * Three-way comparison
 * @curried
 * @param v1
 * @param v2
 */
const int3wayComparision = (v1: u32) => (v2: u32) => {
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

    protected declare repr: CowList<u32>

    private constructor(repr: CowList<u32>) {
        this.repr = repr
    }

    get length(): u32 {
        return this.repr.length
    }

    toArray(): u32[] {
        return this.repr.toArray()
    }

    /**
     * @param value integer to insert
     * @return
     */
    inserted(value: u32): SortedCowList {
        const repr = this.repr
        // Logarithmically search the index of insertion in the list
        const it = repr.atEqual(int3wayComparision(value), false)
        // Apply operations and return a new rope
        return new SortedCowList(repr.inserted(it.index, value))
    }
}
