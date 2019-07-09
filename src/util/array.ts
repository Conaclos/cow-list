/**
 * @param arr array to modify
 * @param v value to pushh onto {@code arr}
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
