import test from "ava"
import { SortedCowList } from "../../examples/sorted-cow-list"

test("sorted-cow-list-empty", (t) => {
    const l = SortedCowList.empty()

    t.is(l.length, 0)
    t.is(l.toArray().length, 0)
})

test("sorted-cow-list-insertions", (t) => {
    const l1 = SortedCowList.empty()
    const l2 = l1
        .inserted(5)
        .inserted(2)
        .inserted(8)
        .inserted(4)
        .inserted(7)
        .inserted(5)

    t.is(l2.length, 6)
    t.deepEqual(l2.toArray(), [2, 4, 5, 5, 7, 8])
})
