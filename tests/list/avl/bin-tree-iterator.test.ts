import test from "ava"
import { AvlList } from "../../../src/list/avl/avl-list"
import { Ordering } from "../../../src/util/ordering"

const V0 = 0
const V1 = 1
const V2 = 2

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
    const it = AvlList.empty().atEqual(() => Ordering.EQUAL)

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
    const it = AvlList.from([1, 2, 3]).atEqual((v) => {
        if (v > 2) {
            return Ordering.BEFORE
        } else if (v < 2) {
            return Ordering.AFTER
        }
        return Ordering.EQUAL
    })

    t.is(it.value, 2)
    t.false(it.done)
    t.is(it.index, 1)
    t.is(it.summary, 1)
})

test("tree-iterator-at-equal-not-found", (t) => {
    const it = AvlList.from([1, 4, 6, 8, 10, 12, 15]).atEqual((v) => {
        if (v > 5) {
            return Ordering.BEFORE
        } else if (v < 5) {
            return Ordering.AFTER
        }
        return Ordering.EQUAL
    })

    t.is(it.value, 6)
    t.false(it.done)
    t.is(it.index, 2)
    t.is(it.summary, 2)
})

test("tree-iterator-at-equal-not-found-forth", (t) => {
    const it = AvlList.from([1, 6, 7, 8, 10, 12, 15]).atEqual((v) => {
        if (v > 5) {
            return Ordering.BEFORE
        } else if (v < 5) {
            return Ordering.AFTER
        }
        return Ordering.EQUAL
    })

    t.is(it.value, 6)
    t.false(it.done)
    t.is(it.index, 1)
    t.is(it.summary, 1)
})
