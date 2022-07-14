//! Copyright (c) 2022 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

import type { Version } from "../index.js"
import { append, lastOf } from "../util/array.js"
import { assert } from "../util/assert.js"
import { lengthOf } from "../util/lengthy.js"
import type { u32 } from "../util/number.js"

export type InternalBtreeNode<V> = BtreeNode<V> & { children: BtreeNode<V>[] }

export function insert<V>(
    root: BtreeNode<V>,
    index: u32,
    v: V,
    ver: Version,
    maxVals: u32
): BtreeNode<V> {
    return (
        root.values.length >= maxVals ? new BtreeNode([], [root], ver) : root
    ).insert(index, v, ver, maxVals)
}

export class BtreeNode<V> {
    declare values: V[]

    declare children: BtreeNode<V>[] | null

    /**
     * Node version.
     * Used for partial persistence.
     */
    declare readonly version: Version

    /**
     * Number of nodes in the subtree rooted by this node.
     */
    declare count: u32

    /**
     * Cumulative summary of all values in the subtree rooted by this node.
     */
    declare summary: u32

    constructor(vs: V[], children: BtreeNode<V>[] | null, ver: Version) {
        assert(children === null || children.length > vs.length)
        this.values = vs
        this.children = children
        this.version = ver
        this.update()
    }

    protected update(): void {
        this.summary = 0
        for (const v of this.values) {
            this.summary += lengthOf(v)
        }
        this.count = this.values.length
        if (this.children !== null) {
            for (const child of this.children) {
                this.count += child.count
                this.summary += child.summary
            }
        }
    }

    // Structural sharing
    /**
     * @param ver
     * @return current node if {@code ver} is equal to {@link BtreeNode#version},
     *  or a new node where {@link BtreeNode#version} is set to {@code ver}.
     */
    protected owned(ver: Version): BtreeNode<V> {
        return this.version === ver
            ? this
            : new BtreeNode(
                  this.values.slice(),
                  this.children !== null ? this.children.slice() : null,
                  ver
              )
    }

    protected isInternal(): this is InternalBtreeNode<V> {
        return this.children !== null
    }

    protected rightmost(): V {
        return this.isInternal()
            ? lastOf(this.children).rightmost()
            : lastOf(this.values)
    }

    insert(index: u32, v: V, ver: Version, maxVals: u32): BtreeNode<V> {
        const self = this.owned(ver)
        if (self.isInternal()) {
            let relIndex = index
            for (let i = 0; i < self.children.length; i++) {
                const child = self.children[i]
                if (relIndex <= child.count) {
                    const ownedChild = child.insert(relIndex, v, ver, maxVals)
                    self.children[i] = ownedChild
                    if (ownedChild.values.length > maxVals) {
                        self.split(i)
                    }
                    break
                }
                relIndex -= child.count + 1 // do not forget to count the value
            }
        } else {
            self.values.splice(index, 0, v)
        }
        self.count++
        self.summary += lengthOf(v)
        return self
    }

    replace(index: u32, v: V, ver: Version): BtreeNode<V> {
        const self = this.owned(ver)
        if (self.isInternal()) {
            let relIndex = index
            for (let i = 0; i < self.children.length; i++) {
                const child = self.children[i]
                if (relIndex < child.count) {
                    const ownedChild = child.replace(relIndex, v, ver)
                    self.children[i] = ownedChild
                    self.summary += ownedChild.summary - child.summary
                    break
                } else if (relIndex === child.count) {
                    self.summary += lengthOf(v) - lengthOf(self.values[i])
                    self.values[i] = v
                    break
                }
                relIndex -= child.count + 1 // do not forget to count the value
            }
        } else {
            self.summary += lengthOf(v) - lengthOf(self.values[index])
            self.values[index] = v
        }
        return self
    }

    delete(index: u32, ver: Version, minVals: u32): BtreeNode<V> {
        const self = this.owned(ver)
        if (self.isInternal()) {
            let relIndex = index
            for (let i = 0; i < self.children.length; i++) {
                const child = self.children[i]
                if (relIndex < child.count) {
                    const oldSUmmary = self.children[i].summary
                    const ownedChild = child.delete(relIndex, ver, minVals)
                    self.children[i] = ownedChild
                    self.summary += ownedChild.summary - oldSUmmary
                    self.balance(i, minVals)
                    break
                } else if (relIndex === child.count) {
                    // remove this.values[i]
                    this.values[i] = child.rightmost()
                    // remove rightmost
                    const oldSUmmary = self.children[i].summary
                    const ownedChild = child.delete(
                        child.count - 1,
                        this.version,
                        minVals
                    )
                    self.children[i] = ownedChild
                    self.summary += ownedChild.summary - oldSUmmary
                    self.balance(i, minVals)
                    break
                }
                relIndex -= child.count + 1 // do not forget to count the value
            }
        } else {
            self.summary -= lengthOf(this.values[index])
            self.values.splice(index, 1)
        }
        self.count--
        return self
    }

    protected balance(
        this: InternalBtreeNode<V>,
        i: number,
        minVals: u32
    ): void {
        if (this.children[i].values.length < minVals) {
            if (i > 0 && this.children[i - 1].values.length > minVals) {
                this.rotateRight(i - 1)
            } else if (
                i < this.values.length &&
                this.children[i + 1].values.length > minVals
            ) {
                this.rotateLeft(i + 1)
            } else {
                this.merge(Math.min(i, this.values.length - 1))
            }
        }
    }

    protected split(this: InternalBtreeNode<V>, i: number): void {
        const ownedLeft = this.children[i].owned(this.version)
        const midIndex = Math.ceil(ownedLeft.values.length / 2) - 1
        const mid = ownedLeft.values[midIndex]
        const right = new BtreeNode(
            ownedLeft.values.slice(midIndex + 1),
            ownedLeft.isInternal()
                ? ownedLeft.children.slice(midIndex + 1)
                : null,
            this.version
        )
        ownedLeft.values.length = midIndex
        if (ownedLeft.isInternal()) {
            ownedLeft.children.length = midIndex + 1
        }
        ownedLeft.update()
        this.values.splice(i, 0, mid)
        this.children.splice(i + 1, 0, right)
    }

    protected merge(this: InternalBtreeNode<V>, i: number): void {
        const ownedLeft = this.children[i].owned(this.version)
        const right = this.children[i + 1]
        ownedLeft.values.push(this.values[i])
        append(ownedLeft.values, right.values)
        if (ownedLeft.children !== null && right.children !== null) {
            append(ownedLeft.children, right.children)
        }
        ownedLeft.count += 1 + right.count
        ownedLeft.summary += lengthOf(this.values[i]) + right.summary
        this.values.splice(i, 1)
        this.children.splice(i + 1, 1) // remove right
    }

    protected rotateLeft(this: InternalBtreeNode<V>, i: number): void {
        const ownedLeft = this.children[i - 1].owned(this.version)
        const ownedRight = this.children[i].owned(this.version)
        const mid = this.values[i - 1]
        ownedLeft.values.push(mid)
        ownedLeft.count++
        ownedLeft.summary += lengthOf(mid)
        const newMid = ownedRight.values.shift()!
        ownedRight.count--
        ownedRight.summary -= lengthOf(newMid)
        this.values[i - 1] = newMid
        if (ownedLeft.isInternal() && ownedRight.isInternal()) {
            const subtree = ownedRight.children.shift()!
            ownedRight.count -= subtree.count
            ownedRight.summary -= subtree.summary
            ownedLeft.children.push(subtree)
            ownedLeft.count += subtree.count
            ownedLeft.summary += subtree.summary
        }
    }

    protected rotateRight(this: InternalBtreeNode<V>, i: number): void {
        const ownedLeft = this.children[i].owned(this.version)
        const ownedRight = this.children[i + 1].owned(this.version)
        const mid = this.values[i]
        ownedRight.values.unshift(mid)
        ownedRight.count++
        ownedRight.summary += lengthOf(mid)
        const newMid = ownedLeft.values.pop()!
        ownedLeft.count--
        ownedLeft.summary -= lengthOf(newMid)
        this.values[i] = newMid
        if (ownedLeft.isInternal() && ownedRight.isInternal()) {
            const subtree = ownedLeft.children.pop()!
            ownedLeft.count -= subtree.count
            ownedLeft.summary -= subtree.summary
            ownedRight.children.unshift(subtree)
            ownedRight.count += subtree.count
            ownedRight.summary += subtree.summary
        }
    }
}
