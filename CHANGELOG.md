# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 2.0.0 (2020-09-17)

### ⚠ BREAKING CHANGES

-   List#atEqual has a new parameter to control the seek bias.

You can simply update this old code:

```js
list.atEqual(f)
```

with:

```js
list.atEqual(f, false)
```

-   Update following codes:

```js
list.summary()
```

with:

```
list.summary
```

### Features

-   add seek biais for list iterators. ([87d20d5](https://github.com/Conaclos/cow-list/commit/87d20d5c5712afa29b36997e2fd9c31296d0ce27))
-   make summary a property of list interface ([dce2cb3](https://github.com/Conaclos/cow-list/commit/dce2cb32ffded5ea7dbfda8d329afc917f8822f4))

### Bug Fixes

-   list from array without infinite recursion ([c3e4ae9](https://github.com/Conaclos/cow-list/commit/c3e4ae9bf490d1df97e2a32dd14d9cff04108c3e))

## 1.0.0 (2020-09-12)
