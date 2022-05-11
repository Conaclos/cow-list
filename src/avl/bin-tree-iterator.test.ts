import test from "oletus"
import { AvlList } from "./avl-list.js"
import { Ordering } from "../util/ordering.js"
import type { u32 } from "../util/number.js"

test("empty-tree-iterator-at-first", (t) => {
    const it = AvlList.empty<string>().atFirst()

    t.ok(it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
    t.deepEqual(it.value, undefined)

    it.forth()
    it.complete()

    t.ok(it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
    t.deepEqual(it.value, undefined)
})

test("empty-tree-iterator-at-equal", (t) => {
    const it = AvlList.empty().atEqual(() => Ordering.EQUAL, false)

    t.ok(it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
    t.deepEqual(it.value, undefined)

    it.forth()
    it.complete()

    t.ok(it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
    t.deepEqual(it.value, undefined)
})

test("tree-iterator-forth", (t) => {
    const it = AvlList.from(["ab", "cde", "f"]).atFirst()

    t.ok(!it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
    t.deepEqual(it.value, "ab")

    it.forth()
    t.ok(!it.done)
    t.deepEqual(it.index, 1)
    t.deepEqual(it.summary, 2)
    t.deepEqual(it.value, "cde")

    it.forth()
    t.ok(!it.done)
    t.deepEqual(it.index, 2)
    t.deepEqual(it.summary, 5)
    t.deepEqual(it.value, "f")

    it.forth()
    t.ok(it.done)
    t.deepEqual(it.index, 3)
    t.deepEqual(it.summary, 6)
    t.deepEqual(it.value, undefined)
})

test("tree-iterator-next", (t) => {
    const expected = ["ab", "cde", "f"]
    const tree = AvlList.from(expected)
    const it = AvlList.from(expected).atFirst()

    const treeValues = []
    for (const v of tree) {
        treeValues.push(v)
    }

    t.deepEqual(treeValues, expected)

    const itValues = []
    for (const v of it) {
        itValues.push(v)
    }

    t.deepEqual(itValues, expected)
})

test("tree-iterator-complete", (t) => {
    const it = AvlList.from(["ab", "cde", "f"]).atFirst()

    t.ok(!it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
    t.deepEqual(it.value, "ab")

    it.complete()
    t.ok(it.done)
    t.deepEqual(it.index, 3)
    t.deepEqual(it.summary, 6)
    t.deepEqual(it.value, undefined)
})

test("tree-iterator-at-equal-found", (t) => {
    const it = AvlList.from([1, 2, 3]).atEqual(int3wayComparison(2), false)

    t.deepEqual(it.value, 2)
    t.ok(!it.done)
    t.deepEqual(it.index, 1)
    t.deepEqual(it.summary, 1)
})

test("tree-iterator-at-equal-not-found-right-bias", (t) => {
    const it = AvlList.from([1, 5, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparison(7),
        false
    )

    t.deepEqual(it.value, 8)
    t.ok(!it.done)
    t.deepEqual(it.index, 3)
    t.deepEqual(it.summary, 3)
})

test("tree-iterator-at-equal-not-found-left-bias", (t) => {
    const it = AvlList.from([1, 5, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparison(9),
        true
    )

    t.deepEqual(it.value, 8)
    t.ok(!it.done)
    t.deepEqual(it.index, 3)
    t.deepEqual(it.summary, 3)
})

test("tree-iterator-at-equal-not-found-right-bias-start", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparison(0),
        false
    )

    t.deepEqual(it.value, 1)
    t.ok(!it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
})

test("tree-iterator-at-equal-not-found-left-bias-start", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparison(0),
        true
    )

    t.deepEqual(it.value, 1)
    t.ok(!it.done)
    t.deepEqual(it.index, 0)
    t.deepEqual(it.summary, 0)
})

test("tree-iterator-at-equal-not-found-right-bias-end", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparison(16),
        false
    )

    t.deepEqual(it.value, undefined)
    t.ok(it.done)
    t.deepEqual(it.index, 7)
    t.deepEqual(it.summary, 7)
})

test("tree-iterator-at-equal-not-found-left-bias-end", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparison(16),
        true
    )

    t.deepEqual(it.value, 15)
    t.ok(!it.done)
    t.deepEqual(it.index, 6)
    t.deepEqual(it.summary, 6)
})

/**
 * Three-way comparison
 * @curried
 * @param v1
 * @param v2
 */
export function int3wayComparison(v1: u32): (v2: u32) => Ordering {
    return function int3wayComparison(v2: u32): Ordering {
        if (v1 < v2) {
            return Ordering.BEFORE
        } else if (v1 > v2) {
            return Ordering.AFTER
        } else {
            return Ordering.EQUAL
        }
    }
}
