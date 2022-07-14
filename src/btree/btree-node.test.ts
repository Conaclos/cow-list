//! Copyright (c) 2022 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import test from "oletus"
import type { Version } from "../core/version.js"
import { BtreeNode, insert } from "./btree-node.js"
import { assert } from "../util/assert.js"

const MAX_VAL_COUNT = 2
const MIN_VAL_COUNT = 1

const V0: Version = 0
const V1: Version = 1

test("toNode", (t) => {
    const root = toNode([0], V0)
    t.deepEqual(root, new BtreeNode([], null, V0))
})

test("mut-insert-in-empty-leaf", (t) => {
    //      ->    a
    const root = toNode([0], V0)

    const newRoot = root.insert(0, "a", V0, MAX_VAL_COUNT) // (1)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0, "a"], V0))
})

test("insert-in-empty-leaf", (t) => {
    //      ->    a
    const root = toNode([0], V0)

    const newRoot = root.insert(0, "a", V1, MAX_VAL_COUNT) // (1)

    t.deepEqual(root, toNode([0], V0))
    t.deepEqual(newRoot, toNode([0, "a"], V1))
})

test("mut-insert-after-in-leaf", (t) => {
    //      ->    aa b
    const root = toNode([0], V0)

    let newRoot = root.insert(0, "a", V0, MAX_VAL_COUNT)
    newRoot = newRoot.insert(1, "b", V0, MAX_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0, "a", "b"], V0))
})

test("mut-insert-before-in-leaf", (t) => {
    //   .   ->    b   -2->    a b
    const root = toNode([0], V0)

    let newRoot = root.insert(0, "b", V0, MAX_VAL_COUNT)
    newRoot = newRoot.insert(0, "a", V0, MAX_VAL_COUNT) // (2)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0, "a", "b"], V0))
})

test("mut-insert-mid-in-tree", (t) => {
    //    c     ->      c
    //   / \           / \
    //  a   e       a b   d e
    const root = toNode([2, [0, "a"], "c", [0, "e"]], V0)

    let newRoot = root.insert(2, "d", V0, MAX_VAL_COUNT)
    newRoot = newRoot.insert(1, "b", V0, MAX_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "a", "b"], "c", [0, "d", "e"]], V0))
})

test("insert-mid-in-tree", (t) => {
    //    c     ->      c
    //   / \           / \
    //  a   e       a b   d e
    const root = toNode([2, [0, "a"], "c", [0, "e"]], V0)

    let newRoot = root.insert(2, "d", V1, MAX_VAL_COUNT)
    newRoot = newRoot.insert(1, "b", V1, MAX_VAL_COUNT)

    t.deepEqual(root, toNode([2, [0, "a"], "c", [0, "e"]], V0))
    t.deepEqual(newRoot, toNode([2, [0, "a", "b"], "c", [0, "d", "e"]], V1))
})

test("mut-insert-split-in-tree", (t) => {
    //      .    ->      b
    //     /            / \
    //  a c            a   c
    const root = toNode([0, "a", "c"], V0)

    const newRoot = insert(root, 1, "b", V0, MAX_VAL_COUNT)

    t.deepEqual(newRoot, toNode([2, [0, "a"], "b", [0, "c"]], V0))
})

test("insert-split-in-tree", (t) => {
    //      .    ->      b
    //     /            / \
    //  a c            a   c
    const root = toNode([0, "a", "c"], V0)

    const newRoot = insert(root, 1, "b", V1, MAX_VAL_COUNT)

    t.deepEqual(root, toNode([0, "a", "c"], V0))
    t.deepEqual(newRoot, toNode([2, [0, "a"], "b", [0, "c"]], V1))
})

test("mut-insert-left-migration-in-tree", (t) => {
    //      e    ->      b e
    //     / \          / | \
    //  a c   g i      a  c  g i
    const root = toNode([2, [0, "a", "c"], "e", [0, "g", "i"]], V0)

    const newRoot = root.insert(1, "b", V0, MAX_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(
        newRoot,
        toNode([2, [0, "a"], "b", [0, "c"], "e", [0, "g", "i"]], V0)
    )
})

test("mut-insert-right-migration-in-tree", (t) => {
    //      e    ->      e h
    //     / \          / | \
    //  a c   g i    a c  g  i
    const root = toNode([2, [0, "a", "c"], "e", [0, "g", "i"]], V0)

    const newRoot = root.insert(4, "h", V0, MAX_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(
        newRoot,
        toNode([2, [0, "a", "c"], "e", [0, "g"], "h", [0, "i"]], V0)
    )
})

test("mut-insert-split-migration-in-tree", (t) => {
    //              .       ->        e
    //             /                /   \
    //      e     k               b        k
    //     /   |   \             / \      / \
    //  a c   g i   m o         a   c  g i   m o
    const root = toNode(
        [2, [0, "a", "c"], "e", [0, "g", "i"], "k", [0, "m", "o"]],
        V0
    )

    const newRoot = insert(root, 1, "b", V0, MAX_VAL_COUNT)

    t.deepEqual(
        newRoot,
        toNode(
            [
                2,
                [2, [0, "a"], "b", [0, "c"]],
                "e",
                [2, [0, "g", "i"], "k", [0, "m", "o"]],
            ],
            V0
        )
    )
})

test("insert-split-migration-in-tree", (t) => {
    //              .       ->        e
    //             /                /   \
    //      e     k               b        k
    //     /   |   \             / \      / \
    //  a c   g i   m o         a   c  g i   m o
    const root = toNode(
        [2, [0, "a", "c"], "e", [0, "g", "i"], "k", [0, "m", "o"]],
        V0
    )

    const newRoot = insert(root, 1, "b", V1, MAX_VAL_COUNT)

    t.deepEqual(
        root,
        toNode([2, [0, "a", "c"], "e", [0, "g", "i"], "k", [0, "m", "o"]], V0)
    )
    t.deepEqual(
        newRoot,
        toNode(
            [
                2,
                [2, [0, "a"], "b", [0, "c"]],
                "e",
                [2, [1, V0, "g", "i"], "k", [1, V0, "m", "o"]],
            ],
            V1
        )
    )
})

test("mut-replace-in-leaf", (t) => {
    //  a c     ->      a b
    const root = toNode([0, "a", "c"], V0)

    const newRoot = root.replace(1, "b", V0)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0, "a", "b"], V0))
})

test("replace-in-leaf", (t) => {
    //  a c     ->      a b
    const root = toNode([0, "a", "c"], V0)

    const newRoot = root.replace(1, "b", V1)

    t.deepEqual(root, toNode([0, "a", "c"], V0))
    t.deepEqual(newRoot, toNode([0, "a", "b"], V1))
})

test("mut-replace-in-tree", (t) => {
    //      e    ->      e
    //     / \          / \
    //  a c   g i     a c  h i
    const root = toNode([2, [0, "a", "c"], "e", [0, "g", "i"]], V0)

    const newRoot = root.replace(3, "h", V0)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "a", "c"], "e", [0, "h", "i"]], V0))
})

test("replace-in-tree", (t) => {
    //      e    ->      e
    //     / \          / \
    //  a c   g i     a c  h i
    const root = toNode([2, [0, "a", "c"], "e", [0, "g", "i"]], V0)

    const newRoot = root.replace(3, "h", V1)

    t.deepEqual(root, toNode([2, [0, "a", "c"], "e", [0, "g", "i"]], V0))
    t.deepEqual(newRoot, toNode([2, [1, V0, "a", "c"], "e", [0, "h", "i"]], V1))
})

test("mut-delete-in-leaf", (t) => {
    //  a c     ->      a b
    const root = toNode([0, "a", "c"], V0)

    const newRoot = root.delete(0, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0, "c"], V0))
})

test("delete-in-leaf", (t) => {
    //  a c     ->      a b
    const root = toNode([0, "a", "c"], V0)

    const newRoot = root.delete(0, V1, MIN_VAL_COUNT)

    t.deepEqual(root, toNode([0, "a", "c"], V0))
    t.deepEqual(newRoot, toNode([0, "c"], V1))
})

test("mut-delete-all-in-leaf", (t) => {
    //  a       ->      .
    const root = toNode([0, "a"], V0)

    const newRoot = root.delete(0, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0], V0))
})

test("delete-all-in-leaf", (t) => {
    //  a       ->      .
    const root = toNode([0, "a"], V0)

    const newRoot = root.delete(0, V1, MIN_VAL_COUNT)

    t.deepEqual(root, toNode([0, "a"], V0))
    t.deepEqual(newRoot, toNode([0], V1))
})
/*
test("mut-delete-mid-merge", (t) => {
    //    b    ->      a c
    //   / \
    //  a   c
    const root = toNode(
        [2, [2, [0, "a"], "b", [0, "c"]], "d", [2, [0, "e"], "f", [0, "g"]]],
        V0
    )

    const newRoot = root.delete(1, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([0, "a", "c"], V0))
})
*/
test("mut-delete-mid-merge-in-tree", (t) => {
    //    b    ->      a c
    //   / \
    //  a   c
    const root = toNode([2, [0, "a"], "b", [0, "c"]], V0)

    const newRoot = root.delete(1, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "a", "c"]], V0))
})

test("mut-delete-migration-right-in-tree", (t) => {
    //    c     ->      d
    //   / \           / \
    //  a   d e       a   e
    const root = toNode([2, [0, "a"], "c", [0, "d", "e"]], V0)

    const newRoot = root.delete(1, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "a"], "d", [0, "e"]], V0))
})

test("mut-delete-migration-left-in-tree", (t) => {
    //      c     ->      b
    //     / \           / \
    //  a b   d         a   d
    const root = toNode([2, [0, "a", "b"], "c", [0, "d"]], V0)

    const newRoot = root.delete(2, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "a"], "b", [0, "d"]], V0))
})

test("mut-delete-rotate-left-in-tree", (t) => {
    //    c     ->      d
    //   / \           / \
    //  a   d e       c   e
    const root = toNode([2, [0, "a"], "c", [0, "d", "e"]], V0)

    const newRoot = root.delete(0, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "c"], "d", [0, "e"]], V0))
})

test("mut-delete-rotate-right-in-tree", (t) => {
    //      c     ->      b
    //     / \           / \
    //  a b   d         a   c
    const root = toNode([2, [0, "a", "b"], "c", [0, "d"]], V0)

    const newRoot = root.delete(3, V0, MIN_VAL_COUNT)

    assert(newRoot === root)
    t.deepEqual(newRoot, toNode([2, [0, "a"], "b", [0, "c"]], V0))
})

/**
 * Provide a way to build an avl tree in a literal way
 */

/**
 * Consist in a tag, versions, values, and children
 * tag 0: zero to 2 values
 * tag 1: version, zero to 2 values
 * tag 2: optional version, values and children
 */
export type ArrayedNode<V> =
    | readonly [0]
    | readonly [0, V]
    | readonly [0, V, V]
    | readonly [1, Version]
    | readonly [1, Version, V]
    | readonly [1, Version, V, V]
    | readonly [2, ArrayedNode<V>]
    | readonly [2, Version, ArrayedNode<V>]
    | readonly [2, ArrayedNode<V>, V, ArrayedNode<V>]
    | readonly [2, Version, ArrayedNode<V>, V, ArrayedNode<V>]
    | readonly [2, ArrayedNode<V>, V, ArrayedNode<V>, V, ArrayedNode<V>]
    | readonly [
          2,
          Version,
          ArrayedNode<V>,
          V,
          ArrayedNode<V>,
          V,
          ArrayedNode<V>
      ]

export function toNode<V>(a: ArrayedNode<V>, ver: Version): BtreeNode<V>
export function toNode<V>(a: ArrayedNode<V>, ver: Version): BtreeNode<V> | null
export function toNode<V>(a: ArrayedNode<V>, ver: Version): BtreeNode<V> {
    if (a[0] === 0) {
        const [_, ...vs] = a
        return new BtreeNode(vs.slice(), null, ver)
    } else if (a[0] === 1) {
        const [_, customVer, ...vs] = a
        return new BtreeNode(vs.slice(), null, customVer)
    }
    const [_, ...xs] = a
    switch (xs.length) {
        case 1:
            return new BtreeNode([], [toNode(xs[0], ver)], ver)
        case 2:
            return new BtreeNode([], [toNode(xs[1], ver)], xs[0])
        case 3:
            return new BtreeNode(
                [xs[1]],
                [toNode(xs[0], ver), toNode(xs[2], ver)],
                ver
            )
        case 4:
            return new BtreeNode(
                [xs[2]],
                [toNode(xs[1], ver), toNode(xs[3], ver)],
                xs[0]
            )
        case 5:
            return new BtreeNode(
                [xs[1], xs[3]],
                [toNode(xs[0], ver), toNode(xs[2], ver), toNode(xs[4], ver)],
                ver
            )
        case 6:
            return new BtreeNode(
                [xs[2], xs[4]],
                [toNode(xs[1], ver), toNode(xs[3], ver), toNode(xs[5], ver)],
                xs[0]
            )
    }
}

export function toArrayed<V>(n: BtreeNode<V>): ArrayedNode<V> {
    if (n.children === null) {
        switch (n.values.length) {
            case 0:
                return [1, n.version]
            case 1:
                return [1, n.version, n.values[0]]
            default:
                return [1, n.version, n.values[0], n.values[1]]
        }
    }
    switch (n.children.length) {
        case 1:
            return [2, n.version, toArrayed(n.children[0])]
        case 2:
            return [
                2,
                n.version,
                toArrayed(n.children[0]),
                n.values[0],
                toArrayed(n.children[1]),
            ]
        default:
            return [
                2,
                n.version,
                toArrayed(n.children[0]),
                n.values[0],
                toArrayed(n.children[1]),
                n.values[1],
                toArrayed(n.children[2]),
            ]
    }
}
