//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import { lengthOf } from "../util/lengthy.js"
import type { Version } from "../core/version.js"
import type { u32 } from "../util/number.js"
import { reduceOf } from "../util/reducible.js"
import { countOf, leftmost, summaryOf } from "./bin-node.js"
import type { BinNode } from "./bin-node.js"

/**
 * @param n
 * @return Rank of {@code n} or 0 if udefined.
 */
export const rankOf = <V>(n: AvlNode<V> | null): u32 =>
    n !== null ? n.rank : 0

/**
 * Node of an AVL tree.
 * The node is partially persistent:
 * old versions of the node must not be modified.
 */
export class AvlNode<V> implements BinNode<V> {
    /**
     * @param v stored value in the created node.
     * @param ver version of the created node.
     * @retur a node without childs.
     */
    static leaf<V>(v: V, ver: Version): AvlNode<V> {
        return new AvlNode(null, v, ver, null)
    }

    /**
     * @param vs a non-empty array of values
     * @param start valid index where the copy begins
     * @param length number of values to copy (at least 1)
     * @param ver tree version
     * @return a balanced tree that contains a number of {@code length} values
     * copied from the index {@code start} in {@code vs}.
     */
    static from<V>(
        vs: ArrayLike<V>,
        start: u32,
        length: u32,
        ver: Version
    ): AvlNode<V> | null {
        if (length === 0) {
            return null
        } else if (length === 1) {
            return AvlNode.leaf(vs[start], ver)
        } else {
            const mid = start + (length >> 1) // integer division by 2
            const l = AvlNode.from(vs, start, mid - start, ver)
            const rStart = mid + 1
            const r = AvlNode.from(vs, rStart, start + length - rStart, ver)
            return new AvlNode(l, vs[mid], ver, r)
        }
    }

    static fromIterator<V>(
        vs: Iterator<V>,
        start: u32,
        length: u32,
        ver: Version
    ): AvlNode<V> | null {
        if (length === 0) {
            return null
        } else if (length === 1) {
            return AvlNode.leaf(vs.next().value, ver)
        } else {
            const mid = start + (length >> 1) // integer division by 2
            const l = AvlNode.fromIterator(vs, start, mid - start, ver)
            const midVal = vs.next().value
            const rStart = mid + 1
            const r = AvlNode.fromIterator(
                vs,
                rStart,
                start + length - rStart,
                ver
            )
            return new AvlNode(l, midVal, ver, r)
        }
    }

    /**
     * Left child.
     */
    declare left: AvlNode<V> | null

    /**
     * Node version.
     * Used for partial persistence.
     */
    declare readonly version: Version

    /**
     * Value stored in the node.
     */
    declare value: V

    /**
     * Right child.
     */
    declare right: AvlNode<V> | null

    /**
     * Number of nodes in the subtree rooted by this node.
     */
    declare count: u32

    /**
     * Rank of the node.
     * Used for balancing the tree.
     */
    declare rank: u32

    /**
     * Cumulative summary of all values in the subtree rooted by this node.
     */
    declare summary: u32

    /**
     * @warning use only for testability purpose. Use {@link AvlNode#leaf}.
     * @param l
     * @param v
     * @param ver
     * @param r
     */
    constructor(
        l: AvlNode<V> | null,
        v: V,
        ver: Version,
        r: AvlNode<V> | null
    ) {
        this.left = l
        this.right = r
        this.version = ver
        this.rank = 0
        this.count = 0
        this.summary = 0
        this.value = v
        this.update() // initialize count, rank, and summary
    }

    /**
     * To keep metadata up-to-date, you should call this function when:
     * - the value is replaced
     * - a child is modified
     */
    protected update(): void {
        this.count = countOf(this.left) + 1 + countOf(this.right)
        this.rank = 1 + Math.max(rankOf(this.left), rankOf(this.right))
        this.summary =
            summaryOf(this.left) + lengthOf(this.value) + summaryOf(this.right)
    }

    // Raw modification
    /**
     * @param l
     * @return Set left child with {@code l} and update metadata.
     */
    protected setLeft(l: AvlNode<V> | null): void {
        this.left = l
        this.update()
    }

    /**
     * @param v
     * @return Set value with {@code v} and update metadata.
     */
    protected setValue(v: V): void {
        this.value = v
        this.update()
    }

    /**
     * @param r
     * @return Set right child with {@code r} and update metadata.
     */
    protected setRight(r: AvlNode<V> | null): void {
        this.right = r
        this.update()
    }

    // Structural sharing
    /**
     * @param ver
     * @return current node if {@code ver} is equal to {@link AvlNode#version},
     *  or a new node where {@link AvlNode#version} is set to {@code ver}.
     */
    protected owned(ver: Version): AvlNode<V> {
        return this.version === ver
            ? this
            : new AvlNode(this.left, this.value, ver, this.right)
    }

    // Balancing
    isBalanced(): boolean {
        return !this.isRightUnbalanced() && !this.isLeftUnbalanced()
    }

    protected isRightUnbalanced(): this is this & { right: AvlNode<V> } {
        return this.rank - rankOf(this.left) >= 3
    }

    protected isRightOriented(): this is this & { right: AvlNode<V> } {
        return this.rank - rankOf(this.left) === 2
    }

    protected isLeftUnbalanced(): this is this & { left: AvlNode<V> } {
        return this.rank - rankOf(this.right) >= 3
    }

    protected isLeftOriented(): this is this & { left: AvlNode<V> } {
        return this.rank - rankOf(this.right) === 2
    }

    protected rotateLeft(this: this & { right: AvlNode<V> }): AvlNode<V> {
        const r = this.right.owned(this.version)
        this.setRight(r.left)
        r.setLeft(this)
        return r
    }

    protected rotateRight(this: this & { left: AvlNode<V> }): AvlNode<V> {
        const l = this.left.owned(this.version)
        this.setLeft(l.right)
        l.setRight(this)
        return l
    }

    protected balance(): AvlNode<V> {
        if (this.isRightUnbalanced()) {
            if (this.right.isLeftOriented()) {
                this.setRight(this.right.rotateRight())
            }
            return this.rotateLeft()
        } else if (this.isLeftUnbalanced()) {
            if (this.left.isRightOriented()) {
                this.setLeft(this.left.rotateLeft())
            }
            return this.rotateRight()
        } else {
            return this
        }
    }

    // Access
    /**
     * @return index of {@link AvlNode#value} in this subtree.
     */
    protected index(): u32 {
        return countOf(this.left)
    }

    /**
     * @param f function to accumulate values of this subtree
     * @param prefix initial value of the accumulator
     * @return accumulated result.
     */
    reduce<U>(f: (acc: U, v: V) => U, prefix: U): U {
        return reduceOf(
            this.right,
            f,
            f(reduceOf(this.left, f, prefix), this.value)
        )
    }

    // Safe modification
    /**
     * @param index insertion index
     * @param v value to insert
     * @param ver modification version
     * @return tree where {@code v} is inserted at {@code index}.
     */
    insert(index: u32, v: V, ver: Version): AvlNode<V> {
        const currIndex = this.index()
        const self = this.owned(ver)
        if (index <= currIndex) {
            const left =
                this.left !== null
                    ? this.left.insert(index, v, ver)
                    : AvlNode.leaf(v, ver)
            self.setLeft(left)
        } else {
            const relIndex = index - currIndex - 1
            const right =
                this.right !== null
                    ? this.right.insert(relIndex, v, ver)
                    : AvlNode.leaf(v, ver)
            self.setRight(right)
        }
        return self.balance()
    }

    /**
     * @param index substitution index
     * @param v substitute
     * @param ver modification version
     * @return tree where the value at {@code index} is repalced by {@code v}.
     */
    replace(index: u32, v: V, ver: Version): AvlNode<V> {
        const currIndex = this.index()
        const self = this.owned(ver)
        if (index < currIndex && this.left !== null) {
            const left = this.left.replace(index, v, ver)
            self.setLeft(left)
        } else if (index > currIndex && this.right !== null) {
            const relIndex = index - currIndex - 1
            const right = this.right.replace(relIndex, v, ver)
            self.setRight(right)
        } else {
            self.setValue(v)
        }
        return self // no need to balance
    }

    /**
     * @param index deletion index
     * @param ver modification version
     * @return tree where the value at {@code index} is deleted.
     */
    delete(index: u32, ver: Version): AvlNode<V> | null {
        const currIndex = this.index()
        if (index < currIndex && this.left !== null) {
            const self = this.owned(ver)
            const left = this.left.delete(index, ver)
            self.setLeft(left)
            return self.balance()
        } else if (index > currIndex && this.right !== null) {
            const self = this.owned(ver)
            const relIndex = index - currIndex - 1
            const right = this.right.delete(relIndex, ver)
            self.setRight(right)
            return self.balance()
        } else {
            return this.deleteCurrent(ver)
        }
    }

    /**
     * @param ver modification version
     * @return tree without this node.
     */
    protected deleteCurrent(ver: Version): AvlNode<V> | null {
        if (this.left === null) {
            return this.right
        } else if (this.right === null) {
            return this.left
        } else {
            const self = this.owned(ver)
            const first = leftmost(this.right)
            self.setValue(first)
            const right = this.right.deleteLeftmost(ver)
            self.setRight(right)
            return self.balance()
        }
    }

    /**
     * @param ver modificatin version
     * @return tree without the node that stores the first value of the subtree.
     */
    protected deleteLeftmost(ver: Version): AvlNode<V> | null {
        if (this.left !== null) {
            const self = this.owned(ver)
            const left = this.left.deleteLeftmost(ver)
            self.setLeft(left)
            return self.balance()
        } else {
            return this.right
        }
    }
}
