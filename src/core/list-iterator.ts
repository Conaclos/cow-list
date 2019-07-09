import type { u32 } from "../util/number"

/**
 * List iterator.
 *
 * Compared to the regular iterator protocol, our protocol provides:
 *  - the index of the current value
 *  - the cumulative summary of the values preceding the current one
 *  - an API designed for fewer object allocations
 */
export interface ListIterator<V> extends Iterable<V> {
    // Access
    /**
     * Has the iterator completed?
     */
    readonly done: boolean

    /**
     * Index (u32) of the current value in the traversed list
     */
    readonly index: u32

    /**
     * Cumulative summary of preceding values
     */
    readonly summary: u32

    /**
     * Current value.
     * If the iterator has completed, then the value is undefined.
     * Note that the value can also be undefined when the type V enables
     * undefined values.
     */
    readonly value: V | undefined

    // Regular iterator
    [Symbol.iterator](): IterableIterator<V>

    // Modification
    /**
     * Complete the iterator.
     */
    complete(): void

    /**
     * Go to the next value if any.
     */
    forth(): void
}
