import type { u32 } from "../util/number.js"

export const LIST_DEL_TYPE = 0
export const LIST_INS_TYPE = 1
export const LIST_SUB_TYPE = 2

export type LIST_DEL_TYPE = typeof LIST_DEL_TYPE
export type LIST_INS_TYPE = typeof LIST_INS_TYPE
export type LIST_SUB_TYPE = typeof LIST_SUB_TYPE

/**
 * List deletion
 */
export interface ListDel {
    /**
     * Type's discriminator
     */
    readonly type: LIST_DEL_TYPE

    /**
     * Index of the value to delete
     */
    readonly index: u32
}

/**
 * List insertion
 */
export interface ListIns<V> {
    /**
     * Type's discriminator
     */
    readonly type: LIST_INS_TYPE

    /**
     * Index of insertion
     */
    readonly index: u32

    /**
     * Value to insert
     */
    readonly value: V
}

/**
 * List substitution
 */
export interface ListSub<V> {
    /**
     * Type's discriminator
     */
    readonly type: LIST_SUB_TYPE

    /**
     * Index of substitution
     */
    readonly index: u32

    /**
     * Substitution value
     */
    readonly value: V
}

/**
 * Operations that can be applied to a list.
 */
export type ListOp<V> = ListDel | ListIns<V> | ListSub<V>

/**
 * @internal
 * Types of operations that can be applied to a list.
 */
type OpType = LIST_DEL_TYPE | LIST_INS_TYPE | LIST_SUB_TYPE

/**
 * @internal
 * Internal representation of a list operation.
 * We use a unique representation to enable code optimization.
 */
interface Op<T extends OpType, V> {
    readonly type: T

    readonly index: u32

    readonly value: V
}

/**
 * @internal
 *
 * @param type operation type
 * @param index index where the operation is applied
 * @param value operation value if any
 */
const op = <T extends OpType, V>(type: T, index: u32, value: V): Op<T, V> => ({
    type,
    index,
    value,
})

/**
 * @param index
 * @return Deletion of the value after {@code index}.
 */
export const del = (index: u32): ListDel => op(LIST_DEL_TYPE, index, undefined)

/**
 * @param index
 * @param value
 * @return Insertion of {@code value} at {@code index}.
 */
export const ins = <V>(index: u32, value: V): ListIns<V> =>
    op(LIST_INS_TYPE, index, value)

/**
 * @param index
 * @param value
 * @return Substitution of the value after {@code index} by {@code value}.
 */
export const sub = <V>(index: u32, value: V): ListSub<V> =>
    op(LIST_SUB_TYPE, index, value)
