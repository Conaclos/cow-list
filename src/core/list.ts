import { AvlList } from "../list/avl/avl-list"
import type { u32 } from "../util/number"
import type { Ordering } from "../util/ordering"
import type { ListIterator } from "./list-iterator"
import type { ListOp } from "./list-op"

/**
 * Function to guide a logarithmic search.
 *
 * @param v
 * @param summary cumulative summary of the values preceding {@code v}.
 * @return direction to search.
 *  {@code Ordering.BEFORE} means that the searched value succeeds {@code v}
 *  {@code Ordering.EQUAL} means that the searched value is {@code v})
 *  {@code Ordering.AFTER} means that the searched value precedes {@code v}
 */
export type Pathfinder<T> = (v: T, summary: u32) => Ordering

/**
 * Common interface between {@link CowList} and {@link MutList}.
 */
export interface List<V> extends Iterable<V> {
    /**
     * @return Number of values in the list.
     */
    readonly length: u32

    /**
     * Cumulative summary of all values
     */
    readonly summary: u32

    /**
     * @param f function to accumulate values
     * @param prefix initial value of the accumulator
     * @return accumulated result
     */
    reduce<U>(f: (acc: U, v: V) => U, prefix: U): U

    /**
     * @return Arrayed version of this list
     */
    toArray(): V[]

    // Iterator
    /**
     * @return iterator that starts to the first value
     */
    atFirst(): ListIterator<V>

    /**
     * Seek for a specific position in the list based on values and summaries.
     *
     * The iterator starts on the value that returns 0 (EQUAL) when passed
     *  through {@code f}.
     * If none value returns 0, then the behavior depends on
     *  {@code leftSeekBias}:
     * - If {@code leftSeekBias} is disabled, then the iterator starts on the
     *   lowest value that returns -1 (BEFORE) when passed through {@code f}.
     *   If no value returns -1, then the iterator is completed
     * - If {@code leftSeekBias} is enabled, then the iterator starts on the
     *   biggest value that returns 1 (AFTER) when passed through {@code f}.
     *   If no value returns 1, then the iterator starts at the first value.
     *
     * @param f function to guide the search in the list
     * @param leftSeekBias
     * @return iterator that starts to a chosen value
     */
    atEqual(f: Pathfinder<V>, leftSeekBias: boolean): ListIterator<V>

    [Symbol.iterator](): IterableIterator<V>
}

/**
 * Copy-on-write List.
 * Objects of type V must have an immutable length (if any).
 */
export interface CowList<V> extends List<V> {
    /**
     * Prefer use {@link CowList#applied} if you need to apply
     *  a batch of operations.
     *
     * @param index deletion index
     * @return new list where the value after {@code index} is deleted
     */
    deleted(index: u32): CowList<V>

    /**
     * Prefer use {@link CowList#applied} if you need to apply
     *  a batch of operations
     *
     * @param index insertion index
     * @param v value to insert
     * @return new list where {@code v} is inserted at {@code index}
     */
    inserted(index: u32, v: V): CowList<V>

    /**
     * Prefer use {@link CowList#applied} if you need to apply
     *  a batch of operations.
     *
     * @param index substitution index
     * @param v substitute
     * @return new list where the value after {@code index} is
     *  repalced by {@code v}
     */
    replaced(index: u32, v: V): CowList<V>

    /**
     * @param ops operation to apply
     * @return new list where {@code ops} is applied
     */
    applied(ops: readonly ListOp<V>[]): CowList<V>
}

export interface CowListConstructor {
    /**
     * @return empty list.
     */
    empty<V>(): CowList<V>

    /**
     * @param vs values to insert
     * @return list that contains the values of {@code vs} in the same order.
     */
    from<V>(vs: ArrayLike<V>): CowList<V>

    /**
     * @param vs values to insert
     * @param len number of value to iterate
     * @return list that contains the values of {@code vs} in the same order.
     */
    fromIterable<V>(vs: Iterable<V>, len: number): CowList<V>
}

export const CowList: CowListConstructor = AvlList

/**
 * A mutable List with partail persistence capabilities.
 * Objects of type V must have an immutable length (if any).
 */
export interface MutList<V> extends List<V> {
    // Structural sharing
    /**
     * A fork of this and this can be independently mutated.
     *
     * @return a fork of this
     */
    fork(): MutList<V>

    // Modification
    /**
     * @param index deletion index
     * @param ver modification version
     * @return list where the value after {@code index} is deleted
     */
    delete(index: u32): void

    /**
     * @param index insertion index
     * @param v value to insert
     * @param ver modification version
     * @return list where {@code v} is inserted at {@code index}
     */
    insert(index: u32, v: V): void

    /**
     * @param index substitution index
     * @param v substitute
     * @param ver modification version
     * @return list where the value after {@code index} is repalced by {@code v}
     */
    replace(index: u32, v: V): void

    /**
     * @param ops operation to apply
     * @param ver modification version
     * @return list where {@code ops} is applied
     */
    apply(ops: readonly ListOp<V>[]): void
}

export interface MutListConstructor {
    /**
     * @return empty list
     */
    empty<V>(): MutList<V>

    /**
     * @param vs values to insert
     * @return list that contains the values of {@code vs} in the same order
     */
    from<V>(vs: ArrayLike<V>): MutList<V>

    /**
     * @param vs values to insert
     * @param len number of value to iterate
     * @return list that contains the values of {@code vs} in the same order.
     */
    fromIterable<V>(vs: Iterable<V>, len: number): MutList<V>
}

export const MutList: MutListConstructor = AvlList
