//! Copyright (c) 2022 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import type { ListIterator } from "../core/list-iterator.js"
import type { Pathfinder } from "../core/list.js"
import { lastOf } from "../util/array.js"
import { lengthOf } from "../util/lengthy.js"
import type { u32 } from "../util/number.js"
import { Ordering } from "../util/ordering.js"
import type { BtreeNode } from "./btree-node.js"

export class BtreeIterator<V> implements ListIterator<V>, Iterator<V> {
    /**
     * @param root tree root
     * @return iterator that starts the traversal at the first (leftmost) value.
     */
    static atFirst<V>(root: BtreeNode<V> | null): BtreeIterator<V> {
        if (root !== null) {
            const nodes = [root]
            const path = [0]
            descendFirst(nodes, path)
            return new BtreeIterator(nodes, path, 0, 0)
        } else {
            return new BtreeIterator([], [], 0, 0)
        }
    }

    /**
     * @param root tree root
     * @param f function to choose where the iterator starts
     * @param leftSeekBias seek bias
     * @return iterator that starts the traversal at a chosen position.
     */
    static atEqual<V>(
        root: BtreeNode<V> | null,
        f: Pathfinder<V>,
        leftSeekBias: boolean
    ): BtreeIterator<V> {
        let dir: Ordering = Ordering.AFTER
        const nodes: BtreeNode<V>[] = []
        const path: u32[] = []
        let index = 0
        let summary = 0
        let curr = root
        while (curr !== null) {
            let lower = 0
            let excludedUpper = curr.values.length
            while (lower < excludedUpper) {
                const mid = (excludedUpper - lower) >> 1
                let prefixCount = index
                let prefixSummary = summary
                for (let i = 0; i < mid; i++) {
                    if (curr.children !== null) {
                        prefixCount += curr.children[i].count
                        prefixSummary += curr.children[i].summary
                    }
                    prefixCount++
                    prefixSummary += lengthOf(curr.values[i])
                }
                dir = f(curr.values[mid], prefixSummary)
                if (dir === Ordering.BEFORE) {
                    excludedUpper = mid
                } else if (dir === Ordering.EQUAL) {
                    lower = mid
                    excludedUpper = mid
                } else {
                    lower = mid + 1
                    index = prefixCount
                    summary = prefixSummary
                }
            }
            nodes.push(curr)
            if (curr.children !== null && dir !== Ordering.EQUAL) {
                const ith = lower + (dir === Ordering.BEFORE ? 0 : 1)
                path.push(ith)
                curr = curr.children[ith]
            } else {
                path.push(lower)
                curr = null
            }
        }

        if (dir === Ordering.AFTER && nodes.length !== 0) {
            if (leftSeekBias) {
                index--
                summary = summary - lengthOf(lastOf(nodes).values[lastOf(path)])
            } else {
                ascendNext(nodes, path)
            }
        } else if (dir === Ordering.BEFORE && leftSeekBias && index !== 0) {
            ascendPrev(nodes, path)
            index--
            summary = summary - lengthOf(lastOf(nodes).values[lastOf(path)])
        }

        return new BtreeIterator(nodes, path, index, summary)
    }

    /**
     * Stack of node.
     * The last element (the head of the stack) is the current traversed node.
     *
     * iterator is done <=> nodes is empty
     */
    protected declare readonly nodes: BtreeNode<V>[]

    /**
     * Stack of selected children.
     * The last element (the head of the stack) is the index
     * of the selected value.
     *
     * iterator is done <=> path is empty
     */
    protected declare readonly path: u32[]

    declare done: boolean

    declare index: u32

    declare summary: u32

    get value(): V | undefined {
        return this.done
            ? undefined
            : lastOf(this.nodes).values[lastOf(this.path)]
    }

    private constructor(
        path: BtreeNode<V>[],
        indexes: u32[],
        index: u32,
        summary: u32
    ) {
        this.nodes = path
        this.path = indexes
        this.done = path.length === 0
        this.index = index
        this.summary = summary
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this
    }

    // Modification
    next(): IteratorResult<V> {
        const { done, value } = this
        this.forth()
        return { done, value } as IteratorResult<V>
    }

    complete(): void {
        if (!this.done) {
            const root = this.nodes[0]
            this.index = root.count
            this.summary = root.summary
            this.done = true
        }
    }

    forth(): void {
        if (!this.done) {
            const { nodes, path } = this
            const curr = lastOf(nodes)
            let cursor = lastOf(path)
            this.index++
            this.summary = this.summary + lengthOf(curr.values[cursor])
            cursor++
            path[path.length - 1] = cursor
            if (curr.children !== null && cursor < curr.children.length) {
                nodes.push(curr.children[cursor])
                path.push(0)
                descendFirst(nodes, path)
            } else if (cursor >= curr.values.length) {
                ascendNext(nodes, path)
                this.done = path.length === 0
            }
        }
    }
}

/**
 * @internal
 * Go to the leftmost node of the tree rooted by the node  indicated by the
 * path.
 *
 * @param nodes non-empty mutable path of nodes
 * @param path non-empty mutable path
 */
function descendFirst<V>(nodes: BtreeNode<V>[], path: u32[]): void {
    let curr = lastOf(nodes)
    while (curr.children !== null) {
        curr = curr.children[0]
        nodes.push(curr)
        path.push(0)
    }
}

/**
 * @internal
 * Go to the node that succeeds the rightmost node of the tree rooted by the
 * node indicated by the path.
 *
 * @param nodes non-empty mutable path of nodes
 * @param path non-empty mutable path
 */
function ascendNext<V>(nodes: BtreeNode<V>[], path: u32[]): void {
    do {
        nodes.pop()
        path.pop()
    } while (path.length !== 0 && lastOf(path) >= lastOf(nodes).values.length)
}

/**
 * @internal
 * Go to the node that succeeds the rightmost node of the tree rooted by the
 * node indicated by the path.
 *
 * @param nodes non-empty mutable path of nodes
 * @param path non-empty mutable path
 */
function ascendPrev<V>(nodes: BtreeNode<V>[], path: u32[]): void {
    let prev: u32
    do {
        nodes.pop()
        prev = path.pop() as u32
    } while (path.length !== 0 && prev === 0)
    if (path.length !== 0) {
        path[path.length - 1]--
    }
}
