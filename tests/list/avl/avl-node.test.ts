import test from "ava"
import type { Version } from "../../../src/core/version.js"
import { AvlNode } from "../../../src/list/avl/avl-node.js"
import { toArrayed, toNode } from "../../_helpers/_arrayed-node-test.js"

const V0: Version = 0
const V1: Version = 1

test("leaf-node", (t) => {
    const leaf = AvlNode.leaf("c", V0)

    t.is(leaf.left, undefined)
    t.is(leaf.value, "c")
    t.is(leaf.version, V0)
    t.is(leaf.right, undefined)
    t.is(leaf.count, V1)
    t.is(leaf.rank, V1)
})

test("leaf-arrayed-node", (t) => {
    const leaf = AvlNode.leaf("c", V0)

    t.deepEqual(leaf, toNode(toArrayed(leaf), V0))
})

test("from-array", (t) => {
    const root = AvlNode.from([1, 2, 3], 0, 3, V0)

    t.deepEqual(root, toNode([[1], 2, [3]], V0))
})

test("reduce", (t) => {
    const root = toNode([["a"], "b", ["c"]], V0)

    const concat = root.reduce((acc, v) => acc + v, "0")

    t.is(concat, "0abc")
})

test("mut-insert-at-left", (t) => {
    /*
        c       -1->        c
                          /
                        a
    */
    const root = AvlNode.leaf("c", V0)

    const newRoot = root.insert(0, "a", V0) // (1)

    t.is(newRoot, root, "is mutated")
    t.deepEqual(root, toNode([["a"], "c", []], V0))
})

test("insert-at-left", (t) => {
    /*
        c       -1->        c       and         c
                          /
                        a
    */
    const root = AvlNode.leaf("c", V0)

    const newRoot = root.insert(0, "a", V1) // (1)

    t.deepEqual(root, toNode(["c"], V0))
    t.deepEqual(newRoot, toNode([["a"], "c", []], V1))
})

test("mut-insert-at-right", (t) => {
    /*
        c       -1->        c
                              \
                                e
    */
    const root = AvlNode.leaf("c", V0)

    const newRoot = root.insert(1, "e", V0) // (1)

    t.is(newRoot, root, "is mutated")
    t.deepEqual(root, toNode([[], "c", ["e"]], V0))
})

test("insert-at-right", (t) => {
    /*
        c       -1->        c       and         c
                              \
                                e
    */
    const root = AvlNode.leaf("c", V0)

    const root1 = root.insert(1, "e", V1) // (1)
    const root2 = root.insert(Number.MAX_SAFE_INTEGER, "e", V1) // (1)

    t.deepEqual(root, toNode(["c"], V0))
    t.deepEqual(root1, toNode([[], "c", ["e"]], V1))
    t.deepEqual(root1, root2)
})

test("mut-replace-at-root", (t) => {
    /*
        c       -1->        x
    */
    const root = AvlNode.leaf("c", V0)

    const newRoot = root.replace(0, "x", V0) // (1)

    t.is(root, newRoot, "is mutated")
    t.deepEqual(root, toNode(["x"], V0))
})

test("replace-at-root", (t) => {
    /*
        c       -1->        x       and     c
    */
    const root = AvlNode.leaf("c", V0)

    const newRoot = root.replace(0, "x", V1) // (1)

    t.deepEqual(root, toNode(["c"], V0))
    t.deepEqual(newRoot, toNode(["x"], V1))
})

test("mut-replace-at-left", (t) => {
    /*
            c       -1->        c
          /                   /
        a                   x
    */
    const root = toNode([["a"], "c", []], V0)

    const newRoot = root.replace(0, "x", V0) // (1)

    t.is(root, newRoot, "is mutated")
    t.deepEqual(root, toNode([["x"], "c", []], V0))
})

test("replace-at-left", (t) => {
    /*
            c       -1->        c       and         c
          /                   /                   /
        a                   x                   a
    */
    const root = toNode([["a"], "c", []], V0)

    const newRoot = root.replace(0, "x", V1) // (1)

    t.deepEqual(root, toNode([["a"], "c", []], V0))
    t.deepEqual(newRoot, toNode([["x"], "c", []], V1))
})

test("mut-replace-at-right", (t) => {
    /*
        c       -1->        c
          \                   \
            e                   x
    */
    const root = toNode([[], "c", ["e"]], V0)

    const newRoot = root.replace(1, "x", V0) // (1)

    t.is(root, newRoot, "is mutated")
    t.deepEqual(root, toNode([[], "c", ["x"]], V0))
})

test("replace-at-right", (t) => {
    /*
        c       -1->        c           and         c
          \                   \                       \
            e                   x                       e
    */
    const root = toNode([[], "c", ["e"]], V0)

    const root1 = root.replace(1, "x", V1) // (1)
    const root2 = root.replace(Number.MAX_SAFE_INTEGER, "x", V1) // (1)

    t.deepEqual(root, toNode([[], "c", ["e"]], V0))
    t.deepEqual(root1, toNode([[], "c", ["x"]], V1))
    t.deepEqual(root1, root2)
})

test("delete-at-root", (t) => {
    const root = AvlNode.leaf("c", V0)

    const newRoot = root.delete(0, V0)

    t.is(newRoot, undefined)
    t.deepEqual(root, toNode(["c"], V0))
})

test("mut-delete-at-left", (t) => {
    /*
            c       -1->        c
          /
        a
    */
    const root = toNode([["a"], "c", []], V0)

    const newRoot = root.delete(0, V0) // (1)

    t.is(root, newRoot, "is mutated")
    t.deepEqual(root, toNode(["c"], V0))
})

test("delete-at-left", (t) => {
    /*
            c       -1->        c       and     c
          /                   /
        a                   a
    */
    const root = toNode([["a"], "c", []], V0)

    const newRoot = root.delete(0, V1) // (1)

    t.deepEqual(root, toNode([["a"], "c", []], V0))
    t.deepEqual(newRoot, toNode(["c"], V1))
})

test("mut-delete-at-right", (t) => {
    /*
        c       -1->        c
          \
            e
    */
    const root = toNode([[], "c", ["e"]], V0)

    const newRoot = root.delete(1, V0) // (1)

    t.is(newRoot, root, "is mutated")
    t.deepEqual(root, toNode(["c"], V0))
})

test("delete-at-right", (t) => {
    /*
        c       -1->        c       and     c
          \                   \
            e                   e
    */
    const root = toNode([[], "c", ["e"]], V0)

    const root1 = root.delete(1, V1) // (1)
    const root2 = root.delete(Number.MAX_SAFE_INTEGER, V1) // (1)

    t.deepEqual(root, toNode([[], "c", ["e"]], V0))
    t.deepEqual(root1, toNode(["c"], V1))
    t.deepEqual(root1, root2)
})

test("balance-r-rotation", (t) => {
    /*
        c       -1->        c       -2->        b
                          /                   /   \
                        b                   a       c
    */
    let n = AvlNode.leaf("c", V0)

    n = n.insert(0, "b", V0) // (1)
    n = n.insert(0, "a", V0) // (2)

    t.deepEqual(n, toNode([["a"], "b", ["c"]], V0))
    t.true(n.isBalanced())
})

test("balance-l-rotation", (t) => {
    /*
        c       -1->        c       -2->        d
                              \               /   \
                                d           c       e
    */
    let n = AvlNode.leaf("c", V0)

    n = n.insert(1, "d", V0) // (1)
    n = n.insert(2, "e", V0) // (2)

    t.deepEqual(n, toNode([["c"], "d", ["e"]], V0))
    t.true(n.isBalanced())
})

test("balance-lr-rotation", (t) => {
    /*
        c       -1->        c       -2->        b
                          /                   /   \
                        a                   a       c
    */
    let n = AvlNode.leaf("c", V0)

    n = n.insert(0, "a", V0) // (1)
    n = n.insert(1, "b", V0) // (2)

    t.deepEqual(n, toNode([["a"], "b", ["c"]], V0))
    t.true(n.isBalanced())
})

test("balance-rl-rotation", (t) => {
    /*
        c       -1->        c       -2->        d
                              \               /   \
                                e           c       e
    */
    let n = AvlNode.leaf("c", V0)

    n = n.insert(1, "e", V0) // (1)
    n = n.insert(1, "d", V0) // (2)

    t.deepEqual(n, toNode([["c"], "d", ["e"]], V0))
    t.true(n.isBalanced())
})

test("delete-at-root-with-left", (t) => {
    /*
                c       -1->       -a
              /
            a
    */
    const root = toNode([["a"], "c", []], V0)

    const newRoot = root.delete(1, V0) // (1)

    t.not(root, newRoot, "is mutated")
    t.deepEqual(root, toNode([["a"], "c", []], V0))
    t.deepEqual(newRoot, toNode(["a"], V0))
})

test("delete-at-root-with-right", (t) => {
    /*
            c       -1->       -e
              \
                e
    */
    const root = toNode([[], "c", ["e"]], V0)

    const newRoot = root.delete(0, V0) // (1)

    t.deepEqual(root, toNode([[], "c", ["e"]], V0))
    t.deepEqual(newRoot, toNode(["e"], V0))
})

test("mut-delete-at-root-with-children", (t) => {
    /*
            c       -1->       -d
          /   \               /   \
        a       e           a       e
               /
             d
    */
    const root = toNode([["a"], "c", [["d"], "e", []]], V0)

    const newRoot = root.delete(1, V0) // (1)

    t.deepEqual(root, toNode([["a"], "d", ["e"]], V0))
})

test("delete-at-root-with-children", (t) => {
    /*
            c       -1->       -d
          /   \               /   \
        a       e           a       e
               /
             d
    */
    const root = toNode([["a"], "c", [["d"], "e", []]], V0)

    const newRoot = root.delete(1, V1) // (1)

    t.deepEqual(root, toNode([["a"], "c", [["d"], "e", []]], V0))
    t.deepEqual(newRoot, toNode([["a", V0], "d", ["e"]], V1))
})
