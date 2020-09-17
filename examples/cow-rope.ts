import { CowList, ins, sub } from "../src/index"
import type { ListOp } from "../src/index"
import { u32 } from "../src/util/number"

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

    get length(): u32 {
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
        })
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
