//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import fc from "fast-check"
import test from "oletus"
import { asU32Between } from "../util/number.js"
import { AvlList } from "./avl-list.js"
import type { AvlNode } from "./avl-node.js"

function isBalanced<V>(n: AvlNode<V> | undefined): boolean {
    return n !== undefined
        ? n.isBalanced() && isBalanced(n.left) && isBalanced(n.right)
        : true
}

test("all-ops", (t) => {
    fc.assert(
        fc.property(
            fc.array(
                fc.nat().map((v) => v * 2 ** -32),
                { minLength: 10 }
            ),
            (values) => {
                const nbDel = Math.floor(values.length / 4)
                const nbSub = Math.floor(values.length / 4)

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

                values.slice(0, nbSub).forEach((randVal, i) => {
                    const index = asU32Between(0, treeList.length, randVal)
                    const subVal = values.length + i
                    treeList.replace(index, subVal)
                    expected.splice(index, 1, subVal)
                })

                t.deepEqual(treeList.toArray(), expected)
                t.ok(
                    isBalanced(
                        (treeList as unknown as { root: AvlNode<unknown> }).root
                    )
                )
            }
        )
    )
})
