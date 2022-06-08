# Changelog

This project adheres to [Semantic Versioning][semver].

## Unreleased

-   Allow to create a list from an iterable

    You can now build a list from any iterable object.
    In the following example we use a generator to create a list of three
    random numbers:

    ```js
    function* rand() {
        while (true) {
            yield Math.random()
        }
    }

    const l = CowList.fromIterable(rand(), 3)
    const ml = MutList.fromIterable(rand(), 3)
    ```

    Note that you must provide the number of items to pick from the
    iterable object in the second parameter.

## 2.0.0 (2020-09-17)

-   Add seek bias for list iterators.

    As a consequence, List#atEqual has a new parameter to control the seek bias.

    You can simply update this old code:

    ```js
    list.atEqual(f)
    ```

    with:

    ```js
    list.atEqual(f, false)
    ```

-   Make summary a property of list interface

    Update following codes:

    ```js
    list.summary()
    ```

    with:

    ```
    list.summary
    ```

-   Fix infinite recursion of list from array

[semver]: https://semver.org/spec/v2.0.0.html
