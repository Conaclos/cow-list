//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import type { CowList, MutList, Pathfinder } from "../core/list.js"
import { LIST_DEL_TYPE, LIST_INS_TYPE, LIST_SUB_TYPE } from "../core/list-op.js"
import type { ListOp } from "../core/list-op.js"
import type { Version } from "../core/version.js"
import { arrayPush } from "../util/array.js"
import type { u32 } from "../util/number.js"
import { reduceOf } from "../util/reducible.js"
import { AvlNode } from "./avl-node.js"
import { BinTreeIterator } from "./bin-tree-iterator.js"
import { summaryOf } from "./bin-node.js"

const INITIAL_VERSION: Version = 0

/**
 * List implemented with an AVL tree.
 * The tree is partially persistent:
 * old versions of the list must not be modified.
 */
export class AvlList<V> implements CowList<V>, MutList<V>, Iterable<V> {
    static empty<V>(): AvlList<V> {
        return new AvlList(undefined, INITIAL_VERSION)
    }

    static from<V>(vs: ArrayLike<V>): AvlList<V> {
        const ver = INITIAL_VERSION
        const root = AvlNode.from(vs, 0, vs.length, ver)
        return new AvlList(root, ver)
    }

    static fromIterable<V>(vs: Iterable<V>, len: u32): AvlList<V> {
        const ver = INITIAL_VERSION
        const root = AvlNode.fromIterator(vs[Symbol.iterator](), 0, len, ver)
        return new AvlList(root, ver)
    }

    /**
     * Tree root.
     */
    protected declare root: AvlNode<V> | undefined

    /**
     * List version.
     *
     * This is used to determinate if the list must be mutated o
     * copied on write.
     */
    protected declare version: Version

    /**
     * @internal
     * @param root root of the tree. Undefined if none.
     * @param ver version of the tree
     */
    private constructor(root: AvlNode<V> | undefined, ver: Version) {
        this.root = root
        this.version = ver
    }

    // Structural sharing
    /**
     * @internal
     * This method must be used with caution.
     * Once called, {@code this} should no longer be mutated.
     *
     * @return a copy-on-write version of this.
     */
    protected cow(): AvlList<V> {
        return new AvlList(this.root, this.version + 1)
    }

    fork(): AvlList<V> {
        this.version++
        return new AvlList(this.root, this.version)
    }

    // Access
    get length(): u32 {
        return this.root !== undefined ? this.root.count : 0
    }

    get summary(): u32 {
        return summaryOf(this.root)
    }

    reduce<U>(f: (acc: U, v: V) => U, prefix: U): U {
        return reduceOf(this.root, f, prefix)
    }

    toArray(): V[] {
        return this.reduce(arrayPush, [] as V[])
    }

    protected toJSON(): readonly V[] {
        return this.toArray()
    }

    // Iterator
    atFirst(): BinTreeIterator<V> {
        return BinTreeIterator.atFirst(this.root)
    }

    atEqual(f: Pathfinder<V>, leftSeekBias: boolean): BinTreeIterator<V> {
        return BinTreeIterator.atEqual(this.root, f, leftSeekBias)
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this.atFirst()
    }

    // Modification
    deleted(index: u32): AvlList<V> {
        const self = this.cow()
        self.delete(index)
        return self
    }

    inserted(index: u32, v: V): AvlList<V> {
        const self = this.cow()
        self.insert(index, v)
        return self
    }

    replaced(index: u32, v: V): AvlList<V> {
        const self = this.cow()
        self.replace(index, v)
        return self
    }

    applied(ops: readonly ListOp<V>[]): AvlList<V> {
        const self = this.cow()
        self.apply(ops)
        return self
    }

    delete(index: u32): void {
        const root = this.root
        if (root !== undefined) {
            this.root = root.delete(index, this.version)
        }
    }

    insert(index: u32, v: V): void {
        const ver = this.version
        this.root =
            this.root !== undefined
                ? this.root.insert(index, v, ver)
                : AvlNode.leaf(v, ver)
    }

    replace(index: u32, v: V): void {
        const root = this.root
        if (root !== undefined) {
            this.root = root.replace(index, v, this.version)
        }
    }

    apply(ops: readonly ListOp<V>[]): void {
        for (const op of ops) {
            switch (op.type) {
                case LIST_DEL_TYPE:
                    this.delete(op.index)
                    break
                case LIST_INS_TYPE:
                    this.insert(op.index, op.value)
                    break
                case LIST_SUB_TYPE:
                    this.replace(op.index, op.value)
            }
        }
    }
}
