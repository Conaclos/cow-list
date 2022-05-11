import test from "ava"
import { AvlList } from "../../../src/list/avl/avl-list.js"
import { Ordering } from "../../../src/util/ordering.js"

/**
 * Three-way comparison
 * @curried
 * @param v1
 * @param v2
 */
const int3wayComparision = (v1: number) => (v2: number) => {
    if (v1 < v2) {
        return Ordering.BEFORE
    } else if (v1 === v2) {
        return Ordering.EQUAL
    } else {
        return Ordering.AFTER
    }
}

test("empty-tree-iterator-at-first", (t) => {
    const it = AvlList.empty<string>().atFirst()

    t.true(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
    t.is(it.value, undefined)

    it.forth()
    it.complete()

    t.true(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
    t.is(it.value, undefined)
})

test("empty-tree-iterator-at-equal", (t) => {
    const it = AvlList.empty().atEqual(() => Ordering.EQUAL, false)

    t.true(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
    t.is(it.value, undefined)

    it.forth()
    it.complete()

    t.true(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
    t.is(it.value, undefined)
})

test("tree-iterator-forth", (t) => {
    const it = AvlList.from(["ab", "cde", "f"]).atFirst()

    t.false(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
    t.is(it.value, "ab")

    it.forth()
    t.false(it.done)
    t.is(it.index, 1)
    t.is(it.summary, 2)
    t.is(it.value, "cde")

    it.forth()
    t.false(it.done)
    t.is(it.index, 2)
    t.is(it.summary, 5)
    t.is(it.value, "f")

    it.forth()
    t.true(it.done)
    t.is(it.index, 3)
    t.is(it.summary, 6)
    t.is(it.value, undefined)
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

    t.false(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
    t.is(it.value, "ab")

    it.complete()
    t.true(it.done)
    t.is(it.index, 3)
    t.is(it.summary, 6)
    t.is(it.value, undefined)
})

test("tree-iterator-at-equal-found", (t) => {
    const it = AvlList.from([1, 2, 3]).atEqual(int3wayComparision(2), false)

    t.is(it.value, 2)
    t.false(it.done)
    t.is(it.index, 1)
    t.is(it.summary, 1)
})

test("tree-iterator-at-equal-not-found-right-bias", (t) => {
    const it = AvlList.from([1, 5, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparision(7),
        false
    )

    t.is(it.value, 8)
    t.false(it.done)
    t.is(it.index, 3)
    t.is(it.summary, 3)
})

test("tree-iterator-at-equal-not-found-left-bias", (t) => {
    const it = AvlList.from([1, 5, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparision(9),
        true
    )

    t.is(it.value, 8)
    t.false(it.done)
    t.is(it.index, 3)
    t.is(it.summary, 3)
})

test("tree-iterator-at-equal-not-found-right-bias-start", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparision(0),
        false
    )

    t.is(it.value, 1)
    t.false(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
})

test("tree-iterator-at-equal-not-found-left-bias-start", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparision(0),
        true
    )

    t.is(it.value, 1)
    t.false(it.done)
    t.is(it.index, 0)
    t.is(it.summary, 0)
})

test("tree-iterator-at-equal-not-found-right-bias-end", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparision(16),
        false
    )

    t.is(it.value, undefined)
    t.true(it.done)
    t.is(it.index, 7)
    t.is(it.summary, 7)
})

test("tree-iterator-at-equal-not-found-left-bias-end", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual(
        int3wayComparision(16),
        true
    )

    t.is(it.value, 15)
    t.false(it.done)
    t.is(it.index, 6)
    t.is(it.summary, 6)
})
