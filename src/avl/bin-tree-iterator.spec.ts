import fc from "fast-check"
import test from "oletus"
import { asU32Between } from "../util/number.js"
import { AvlList } from "./avl-list.js"

test("at-first", (t) => {
    fc.assert(
        fc.property(
            fc.array(
                fc.nat().map((v) => v * 2 ** -32),
                { minLength: 10 }
            ),
            (values) => {
                const treeList = AvlList.empty<number>()
                const expected: number[] = []

                values.sort()
                values.forEach((val) => {
                    const index = asU32Between(0, treeList.length + 1, val)
                    treeList.insert(index, val)
                    expected.splice(index, 0, val)
                })

                const built: number[] = []
                for (const v of treeList) {
                    built.push(v)
                }

                t.deepEqual(built, expected)
            }
        )
    )
})
