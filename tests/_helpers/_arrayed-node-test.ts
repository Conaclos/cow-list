import type { Version } from "../../src/core/version.js"
import { AvlNode } from "../../src/list/avl/avl-node.js"

/**
 * Provide a way to build an avl tree in a literal way
 */

export type ArrayedNonEmptyNode<V> =
    | readonly [V]
    | readonly [V, Version]
    | readonly [ArrayedNode<V>, V, ArrayedNode<V>]
    | readonly [ArrayedNode<V>, V, Version, ArrayedNode<V>]

export type ArrayedNode<V> = readonly [] | ArrayedNonEmptyNode<V>

export function toNode<V>(a: ArrayedNonEmptyNode<V>, v: Version): AvlNode<V>
export function toNode<V>(a: ArrayedNode<V>, v: Version): AvlNode<V> | undefined
export function toNode<V>(
    a: ArrayedNode<V>,
    ver: Version
): AvlNode<V> | undefined {
    switch (a.length) {
        case 1:
            return AvlNode.leaf(a[0], ver)
        case 2:
            return AvlNode.leaf(a[0], a[1])
        case 3:
            return new AvlNode(toNode(a[0], ver), a[1], ver, toNode(a[2], ver))
        case 4:
            return new AvlNode(toNode(a[0], ver), a[1], a[2], toNode(a[3], ver))
    }
    return undefined
}

const EMPTY_ARRAYED_NODE = [] as const

export function toArrayed<V>(n: AvlNode<V>): ArrayedNode<V> {
    const l = n.left !== undefined ? toArrayed(n.left) : EMPTY_ARRAYED_NODE
    const r = n.right !== undefined ? toArrayed(n.right) : EMPTY_ARRAYED_NODE
    return [l, n.value, n.version, r]
}
