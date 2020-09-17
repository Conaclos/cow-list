import test from "ava"
import { del, ins, sub } from "../../../src/"
import { AvlList } from "../../../src/list/avl/avl-list"

test("avl-empty", (t) => {
    const emp = AvlList.empty<string>()

    t.is(emp.length, 0)
    t.deepEqual(emp.toArray(), [])
})

test("avl-from-empty-array", (t) => {
    const emp = AvlList.from([])

    t.is(emp.length, 0)
    t.deepEqual(emp.toArray(), [])
})

test("avl-from-non-empty-array-odd-length", (t) => {
    const emp = AvlList.from(["a", "b", "c"])

    t.is(emp.length, 3)
    t.deepEqual(emp.toArray().join(""), "abc")
})

test("avl-from-non-empty-array-even-length", (t) => {
    const emp = AvlList.from(["a", "b", "c", "d"])

    t.is(emp.length, 4)
    t.deepEqual(emp.toArray().join(""), "abcd")
})

test("avl-insert", (t) => {
    const l = AvlList.empty<string>()
    l.insert(0, "c")
    l.insert(0, "a")
    l.insert(2, "e")
    l.insert(1, "b")
    l.insert(3, "d")

    t.is(l.toArray().join(""), "abcde")
})

test("avl-replace", (t) => {
    const l = AvlList.empty<string>()
    l.insert(0, "y")
    l.insert(0, "x")
    l.insert(2, "e")
    l.insert(1, "b")
    l.insert(3, "d")

    l.replace(0, "a")
    l.replace(2, "c")

    t.is(l.toArray().join(""), "abcde")
})

test("avl-delete", (t) => {
    const l = AvlList.empty<string>()
    l.insert(0, "c")
    l.insert(0, "x")
    l.insert(0, "a")
    l.insert(3, "e")
    l.insert(1, "b")
    l.insert(4, "d")
    l.insert(6, "y")

    l.delete(2)
    l.delete(6)

    t.is(l.toArray().join(""), "abcde")
})

test("avl-apply", (t) => {
    const ops = [ins(0, "x"), ins(0, "b"), ins(0, "y"), del(2), sub(0, "a")]
    const l = AvlList.empty<string>()
    l.apply([]) // no ops
    l.apply(ops) // with ops

    t.is(l.toArray().join(""), "ab")
})

test("to-json", (t) => {
    const l = AvlList.empty<string>()
    l.insert(0, "c")
    l.insert(0, "a")
    l.insert(2, "e")
    l.insert(1, "b")
    l.insert(3, "d")

    t.is(JSON.stringify(l), JSON.stringify("a b c d e".split(" ")))
})

test("fork", (t) => {
    const l = AvlList.empty<string>()
    l.insert(0, "c")
    l.insert(0, "x")
    l.insert(0, "a")
    l.insert(3, "e")
    l.insert(1, "b")
    l.insert(4, "d")
    l.insert(6, "y")

    const l1 = l.fork()
    l1.delete(2)
    l1.delete(6)

    const l2 = l.fork()
    l2.replace(2, "X")
    l2.replace(7, "Y")

    t.is(l.toArray().join(""), "abxcdey")
    t.is(l1.toArray().join(""), "abcde")
    t.is(l2.toArray().join(""), "abXcdeY")
})

test("avl-deleted-inserted-replaced", (t) => {
    const l = AvlList.empty<string>()
    const l1 = l.inserted(0, "c")
    const l2 = l1.inserted(0, "a")
    const l3 = l2.inserted(1, "x")
    const l4 = l3.deleted(1)
    const l4p = l3.replaced(1, "b")

    t.is(l.toArray().join(""), "")
    t.is(l1.toArray().join(""), "c")
    t.is(l2.toArray().join(""), "ac")
    t.is(l3.toArray().join(""), "axc")
    t.is(l4.toArray().join(""), "ac")
    t.is(l4p.toArray().join(""), "abc")
})

test("avl-applied", (t) => {
    const ops = [ins(0, "x"), ins(0, "b"), ins(0, "y"), del(2), sub(0, "a")]
    const l = AvlList.empty<string>()
    const l1 = l.applied(ops)

    t.is(l.toArray().join(""), "")
    t.is(l1.toArray().join(""), "ab")
})
