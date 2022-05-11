import { fc, testProp } from "ava-fast-check"
import { AvlList } from "../../../src/list/avl/avl-list.js"
import type { AvlNode } from "../../../src/list/avl/avl-node.js"
import { asU32Between } from "../../_helpers/_rand-test.js"

const isBalanced = <V>(n: AvlNode<V> | undefined): boolean =>
    n !== undefined
        ? n.isBalanced() && isBalanced(n.left) && isBalanced(n.right)
        : true

testProp(
    "all-ops",
    [fc.array(fc.float(), { minLength: 0, maxLength: 1000 })],
    (t, values) => {
        const nbDel = Math.floor(values.length / 4)
        const nsSub = Math.floor(values.length / 4)

        const treeList = AvlList.empty<number>()
        const expected: number[] = []

        values.forEach((randVal, i) => {
            const index = asU32Between(0, treeList.length + 1, randVal)
            const insVal = i
            treeList.insert(index, insVal)
            expected.splice(index, 0, insVal)
        })

        values.slice(0, nbDel).forEach((randVal) => {
            const index = asU32Between(0, treeList.length, randVal)
            treeList.delete(index)
            expected.splice(index, 1)
        })

        values.slice(0, nsSub).forEach((randVal, i) => {
            const index = asU32Between(0, treeList.length, randVal)
            const subVal = values.length + i
            treeList.replace(index, subVal)
            expected.splice(index, 1, subVal)
        })

        t.deepEqual(treeList.toArray(), expected)
        t.true(isBalanced((treeList as any).root))
    }
)
