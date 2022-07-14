//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

const push = Array.prototype.push

/**
 * Push every value of {@link vs} onto {@link arr}.
 *
 * @param arr array to modify
 * @param vs values to push onto {@code arr}
 */
export const append = <V>(arr: V[], vs: V[]): void => {
    push.apply(arr, vs)
}

/**
 * @param arr array to modify
 * @param v value to push onto {@code arr}
 * @return {@code arr}.
 */
export const arrayPush = <V>(arr: V[], v: V): V[] => {
    arr.push(v)
    return arr
}

/**
 * @param arr non-empty array
 * @return Last item of {@code arr}.
 */
export const lastOf = <V>(arr: readonly V[]): V => arr[arr.length - 1]
