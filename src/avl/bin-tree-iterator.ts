import { lengthOf } from "../core/lengthy.js"
import type { Pathfinder } from "../core/list.js"
import type { ListIterator } from "../core/list-iterator.js"
import { lastOf } from "../util/array.js"
import type { u32 } from "../util/number.js"
import { Ordering } from "../util/ordering.js"
import { countOf, summaryOf } from "./bin-node.js"
import type { BinNode } from "./bin-node.js"

/**
 * @internal
 * Go to the leftmost node of the tree rooted by the node  indicated by the
 * path.
 *
 * @param path non-empty mutable path of binary node
 */
const descendFirst = <V>(path: BinNode<V>[]): void => {
    let curr = lastOf(path).left
    while (curr !== undefined) {
        path.push(curr)
        curr = curr.left
    }
}

/**
 * @internal
 * Go to the node that succeeds the rightmost node of the tree rooted by the
 * node indicated by the path.
 *
 * @param path non-empty mutable path of binary node
 */
const ascendNext = <V>(path: BinNode<V>[]): void => {
    let prev: BinNode<V> | undefined
    do {
        prev = path.pop()
    } while (path.length !== 0 && lastOf(path).right === prev)
}

/**
 * @internal
 * Go to the node that succeeds the rightmost node of the tree rooted by the
 * node indicated by the path.
 *
 * @param path non-empty mutable path of binary node
 */
const ascendPrev = <V>(path: BinNode<V>[]): void => {
    let prev: BinNode<V> | undefined
    do {
        prev = path.pop()
    } while (path.length !== 0 && lastOf(path).left === prev)
}

/**
 * Iterator for in-order traversal of a binary tree.
 */
export class BinTreeIterator<V> implements ListIterator<V>, Iterator<V> {
    /**
     * @param root tree root
     * @return iterator that starts the traversal at the first (leftmost) value.
     */
    static atFirst<V>(root: BinNode<V> | undefined): BinTreeIterator<V> {
        if (root !== undefined) {
            const path = [root]
            descendFirst(path)
            return new BinTreeIterator(path, 0, 0)
        } else {
            return new BinTreeIterator([], 0, 0)
        }
    }

    /**
     * @param root tree root
     * @param f function to choose where the iterator starts
     * @param leftSeekBias seek bias
     * @return iterator that starts the traversal at a chosen position.
     */
    static atEqual<V>(
        root: BinNode<V> | undefined,
        f: Pathfinder<V>,
        leftSeekBias: boolean
    ): BinTreeIterator<V> {
        let dir: Ordering = Ordering.AFTER
        const path: BinNode<V>[] = []
        let index = 0
        let summary = 0
        let curr = root
        while (curr !== undefined) {
            path.push(curr)
            const prefixSummary = summary + summaryOf(curr.left)
            dir = f(curr.value, prefixSummary)
            if (dir === Ordering.BEFORE) {
                curr = curr.left
            } else if (dir === Ordering.EQUAL) {
                index = index + countOf(curr.left)
                summary = prefixSummary
                curr = undefined
            } else {
                index = index + countOf(curr.left) + 1
                summary = prefixSummary + lengthOf(curr.value)
                curr = curr.right
            }
        }

        if (dir === Ordering.AFTER && path.length !== 0) {
            if (leftSeekBias) {
                index--
                summary = summary - lengthOf(lastOf(path).value)
            } else {
                ascendNext(path)
            }
        } else if (dir === Ordering.BEFORE && leftSeekBias && index !== 0) {
            ascendPrev(path)
            index--
            summary = summary - lengthOf(lastOf(path).value)
        }

        return new BinTreeIterator(path, index, summary)
    }

    /**
     * Stack of node.
     * The last element (the head of the stack) is the current traversed node.
     *
     * iterator is done <=> path is empty
     */
    protected declare readonly path: BinNode<V>[]

    declare done: boolean

    declare index: u32

    declare summary: u32

    get value(): V | undefined {
        return this.done ? undefined : lastOf(this.path).value
    }

    private constructor(path: BinNode<V>[], index: u32, summary: u32) {
        this.done = path.length === 0
        this.summary = summary
        this.index = index
        this.path = path
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this
    }

    // Modification
    next(): IteratorResult<V> {
        const done = this.done
        const value = this.value
        this.forth()
        return { done, value } as IteratorResult<V>
    }

    complete(): void {
        if (!this.done) {
            const root = this.path[0]
            this.index = root.count
            this.summary = root.summary
            this.done = true
        }
    }

    forth(): void {
        if (!this.done) {
            const path = this.path
            const curr = lastOf(path)
            this.index++
            this.summary = this.summary + lengthOf(curr.value)
            if (curr.right !== undefined) {
                path.push(curr.right)
                descendFirst(path)
            } else {
                ascendNext(path)
                this.done = path.length === 0
            }
        }
    }
}
