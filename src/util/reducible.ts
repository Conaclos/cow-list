/**
 * Data strcuture that can be reduced.
 */
export interface Reducible<V> {
    readonly reduce: <U>(f: (acc: U, v: V) => U, prfeix: U) => U
}

/**
 * @param r data strcuture to reduce
 * @param f function that accumulated the traversed values
 * @param prefix initial accumulator
 * @return accumulated result.
 */
export const reduceOf = <V, U>(
    r: Reducible<V> | undefined,
    f: (acc: U, v: V) => U,
    prefix: U
): U => (r !== undefined ? r.reduce(f, prefix) : prefix)
