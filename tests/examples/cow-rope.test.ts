import test from "ava"
import { CowRope } from "../../examples/cow-rope.js"

test("cow-rope-empty", (t) => {
    const r = CowRope.empty()

    t.is(r.length, 0)
    t.is(r.toString(), "")
})

test("cow-rope-insertions", (t) => {
    const r1 = CowRope.empty()
    const r2 = r1.inserted(0, "cd")
    const r3 = r2.inserted(2, "gh")
    const r4 = r3.inserted(2, "ef")
    const r5 = r4.inserted(0, "ab")
    const r6 = r5.inserted(8, "ij")

    t.is(r2.length, 2)
    t.is(r2.toString(), "cd")
    t.is(r3.length, 4)
    t.is(r3.toString(), "cdgh")
    t.is(r4.length, 6)
    t.is(r4.toString(), "cdefgh")
    t.is(r5.length, 8)
    t.is(r5.toString(), "abcdefgh")
    t.is(r6.length, 10)
    t.is(r6.toString(), "abcdefghij")
})

test("cow-rope-split", (t) => {
    const r1 = CowRope.empty()
    const r2 = r1.inserted(0, "abef")
    const r3 = r2.inserted(2, "cd")

    t.is(r3.length, 6)
    t.is(r3.toString(), "abcdef")
})
