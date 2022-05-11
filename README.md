# Cow List 🐄🐄🐄

[![CI status][ci-img]][ci-url]
[![Coverage percentage][coveralls-img]][coveralls-url]
[![NPM version][npm-version-img]][npm-url]

_Cow List_ provides a [Copy-On-Write][cow] iterable list that supports logarithmic searches.
It provides also a mutable iterable List with versioning capabilities.

_Cow List_ naively supports lengthy values (objects with a length property). This makes _Cow List_ a perfect fit to implement a [rope][rope].

## Highlights

### Immutable or mutable

_Cow List_ provides immutable lists and mutable lists.
Immutable lists are well-suited for projects that embrace immutability and purity.
They use a [copy-on-write][cow] strategy to achieve better performances.
Mutable lists have versioning capabilities that enable to fork a the list into two independent mutable lists.
They are well-suited for projects that implements their own copy-on-write data structures.

### A building block

_Cow List_ implements a close to minimum set of features.
This makes _Cow List_ lightweight (2kB minified and gziped).
These features are carefully chosen for enabling the design of advanced data structures.
For instance, _Cow List_ enables to implement sorted lists and [ropes][rope].

### Lengthy values

_Cow List_ is aware of lengthy values (objects with a length property).
When you iterate over a list, you have access to the cumulated length (summary) of the traversed values.
This enables to efficiently implement a [rope][rope].

### Logarithmic searches

The main way to traverse a list is to get an iterator.
_Cow List_ enables to logarithmically chooses where to start the iteration.

## Getting started

Install [cow-list](#) as a dependency:

```sh
npm install cow-list
```

### Immutable list

```ts
import { CowList } from "cow-list"

let l = CowList.empty<string>()
l = l.inserted(0, "ab")
l = l.inserted(1, "c")
l = l.inserted(2, "d")
l = l.deleted(1)
l = l.replaced(1, "de")

for (const v of l) {
    console.log(v)
    // ab
    // de
}
```

### Mutable list

```ts
import { MutList } from "cow-list"

let l = MutList.empty<string>()
l.insert(0, "ab")
l.insert(1, "c")
l.insert(2, "d")
l.delet(1)
l.replac(1, "de")

for (const v of l) {
    console.log(v)
    // ab
    // de
}
```

## Advanced usages

Please take a look to the provided [examples](./src/examples/).

## FAQ

### Why did you design yet another list?

I wished to have a generic building block to implement [Dotted LogootSplit][dls].
Dotted LogootSplit is a new replicated data structure designed for collaborative editing.
The data structure combines a search tree and a rope.

### Which data structure is internally used?

For now, _Cow List_ uses a [partially persistent][pp] [AVL tree][avl].
This could change in the future in order to achieve better performances.

[ci-img]: https://flat.badgen.net/github/checks/Conaclos/cow-list/?label=CI
[ci-url]: https://github.com/Conaclos/cow-list/actions/workflows/ci.yml
[npm-version-img]: https://flat.badgen.net/npm/v/cow-list
[npm-url]: https://www.npmjs.com/package/cow-list
[coveralls-img]: https://flat.badgen.net/coveralls/c/github/Conaclos/cow-list
[coveralls-url]: https://coveralls.io/github/Conaclos/cow-list?branch=main
[cow]: https://en.wikipedia.org/wiki/Copy-on-write
[rope]: https://en.wikipedia.org/wiki/Rope_%28data_structure%29
[avl]: https://en.wikipedia.org/wiki/AVL_tree
[dls]: https://github.com/coast-team/dotted-logootsplit
[pp]: https://en.wikipedia.org/wiki/Persistent_data_structure
