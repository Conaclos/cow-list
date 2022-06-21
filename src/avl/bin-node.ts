//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import type { u32 } from "../util/number.js"

/**
 * Valued binary node with extra metadata.
 */
export interface BinNode<V> {
    /**
     * Optional left child
     */
    readonly left: BinNode<V> | null

    /**
     * Stored value
     */
    readonly value: V

    /**
     * Optional right child
     */
    readonly right: BinNode<V> | null

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
 * @returns Count of {@code n} or 0 if null.
 */
export const countOf = <V>(n: BinNode<V> | null): u32 =>
    n !== null ? n.count : 0

/**
 * @param n
 * @returns Summary of {@code n} or 0 if null.
 */
export const summaryOf = <V>(n: BinNode<V> | null): u32 =>
    n !== null ? n.summary : 0

export const leftmost = <V>(n: BinNode<V>): V =>
    n.left !== null ? leftmost(n.left) : n.value
