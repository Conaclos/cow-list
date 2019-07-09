import type { u32 } from "../../util/number"

/**
 * Valued binary node with extra metadata.
 */
export interface BinNode<V> {
    /**
     * Optional left child
     */
    readonly left: BinNode<V> | undefined

    /**
     * Stored value
     */
    readonly value: V

    /**
     * Optional right child
     */
    readonly right: BinNode<V> | undefined

    /**
     * Total number of nodes in the subtree rooted by this.
     */
    readonly count: u32

    /**
     * Summary of the values stored in the subtree rooted by this.
     */
    readonly summary: u32
}

/**
 * @param n
 * @returns Count of {@code n} or 0 if undefined.
 */
export const countOf = <V>(n: BinNode<V> | undefined): u32 =>
    n !== undefined ? n.count : 0

/**
 * @param n
 * @returns Summary of {@code n} or 0 if undefined.
 */
export const summaryOf = <V>(n: BinNode<V> | undefined): u32 =>
    n !== undefined ? n.summary : 0

export const leftmost = <V>(n: BinNode<V>): V =>
    n.left !== undefined ? leftmost(n.left) : n.value
