//! Copyright (c) 2019 Victorien Elvinger
//! Licensed under Apache License 2.0 (https://apache.org/licenses/LICENSE-2.0)

/**
 * Possible relation between two elements in a totally ordered set.
 */
export const Ordering = {
    BEFORE: -1,
    EQUAL: 0,
    AFTER: 1,
} as const

export type Ordering =
    | typeof Ordering.BEFORE
    | typeof Ordering.EQUAL
    | typeof Ordering.AFTER
