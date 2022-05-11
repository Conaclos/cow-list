import { fc, testProp } from "ava-fast-check"
import { AvlList } from "../../../src/list/avl/avl-list.js"
import { asU32Between } from "../../_helpers/_rand-test.js"

testProp("at-first", [fc.array(fc.float(), 0, 200)], (t, values) => {
    const treeList = AvlList.empty<number>()
    const expected: number[] = []

    values.sort()
    values.forEach((val, i) => {
        const index = asU32Between(0, treeList.length + 1, val)
        treeList.insert(index, val)
        expected.splice(index, 0, val)
    })

    const built: number[] = []
    for (const v of treeList) {
        built.push(v)
    }

    t.deepEqual(built, expected)
})
