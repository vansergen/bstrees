# bstrees [![CI Status](https://github.com/vansergen/bstrees/actions/workflows/ci.yml/badge.svg)](https://github.com/vansergen/bstrees/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/bstrees)](https://www.npmjs.com/package/bstrees) [![Coverage Status](https://coveralls.io/repos/github/vansergen/bstrees/badge.svg?branch=main)](https://coveralls.io/github/vansergen/bstrees?branch=main) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![node version](https://img.shields.io/node/v/bstrees) ![npm downloads](https://img.shields.io/npm/dt/bstrees) ![License](https://img.shields.io/github/license/vansergen/bstrees)

Sorted sets backed by binary search trees: a self-balancing `AVLTree` and a
plain `BSTree`. Values are kept in order by a comparator, so besides lookups
you get ordered iteration, range queries and nearest-value searches.

- Set-like API: `insert`, `has`, `get`, `getOrInsert`, `delete`, `clear`
- Ordered queries: `min`, `max`, `popMin`, `popMax`, `floor`, `ceil`,
  `lower`, `higher`, `range`, reverse iteration
- Iterators that support iterator helpers and tolerate modifications
- No dependencies, no recursion, fully typed

## Installation

```bash
npm install bstrees
```

Requires Node.js 24 or newer. The package is an ES module; `require("bstrees")`
works too through Node.js `require(esm)`.

TypeScript users need TypeScript 5.6 or newer. Two compiler options matter:

- the iterator helpers (`tree.values().filter(...)`) are typed only with the
  `esnext` library (or `es2025` on TypeScript 6), for example
  `"lib": ["esnext"]`;
- a CommonJS project that `require`s the package needs
  `"module": "nodenext"` and TypeScript 5.8 or newer.

## Quick start

```typescript
import { AVLTree } from "bstrees";

const tree = AVLTree.from([5, 1, 4, 2, 3]);

tree.insert(6); // true
tree.insert(6); // false: the value is already stored
tree.has(4); // true
tree.delete(1); // true
tree.toArray(); // [2, 3, 4, 5, 6]
tree.floor(4.5); // 4
tree.ceil(4.5); // 5
[...tree.range({ gte: 3, lt: 5 })]; // [3, 4]
tree.popMax(); // 6
```

## Choosing a tree

| Tree      | Lookup, insert, delete       | Notes                                                                     |
| --------- | ---------------------------- | ------------------------------------------------------------------------- |
| `AVLTree` | O(log n)                     | Self-balancing. **Use it by default.**                                    |
| `BSTree`  | O(log n) average, O(n) worst | No rebalancing. Inserting values in sorted order degrades it into a list. |

`BSTree` is only O(log n) on average for values inserted in random order.
Removing a node with two children always moves its successor up, so a
long-lived tree with many random removals and insertions gets deeper over time
(towards √n). Use `AVLTree` for such workloads.

Both trees implement the same `SortedTree<T>` interface. Use that type to accept
either of them.

## Comparators

A tree orders its values with a comparator `(a, b) => number`. It returns:

- a negative number when `a` sorts before `b`;
- a positive number when `a` sorts after `b`;
- zero when they are equal.

Values are unique with respect to the comparator. Inserting a value equal to a
stored one keeps the stored one.

The comparator must define a consistent total order:

- it returns `0` for equal arguments and never returns `NaN`;
- `compare(a, b)` and `compare(b, a)` have opposite signs;
- it is transitive;
- it gives the same result for the same stored values for as long as they are
  in the tree. Do not mutate the fields it reads.

The tree may call it with its arguments in either order, and calls it without
a receiver: a strict-mode function gets `this === undefined`, a bound function
keeps its bound `this`. If the comparator throws, the error propagates and the
tree is left unchanged. A result that is not a number, or is `NaN`, throws a
`TypeError`.

The comparator must not modify the tree it orders. The mutating methods
(`insert`, `getOrInsert`, `delete`, `clear`, `popMin`, `popMax`) throw a
`TypeError` when called from the comparator, before they change anything.
Reading the tree or modifying other trees from the comparator is allowed.

**Default comparator.** It is used when no comparator is passed and handles
numbers, strings and bigints:

- `-0` equals `0`;
- strings are compared by UTF-16 code units;
- `NaN`, values of different types and anything else (objects, dates,
  `undefined`, ...) throw a `TypeError`.

Every method that takes a value, including the bounds of `range`, passes it to
the comparator even when the tree is empty, so `has(NaN)` throws whether the
tree is empty or not. A value of another type, such as `"1"` in a tree of
numbers, can only be detected once the tree holds a value to compare it with.

TypeScript requires a comparator for any other value type:

```typescript
import { AVLTree, BSTree } from "bstrees";

// Descending numbers
const descending = new AVLTree<number>((a, b) => b - a);

// Locale-aware strings
const { compare } = new Intl.Collator("de");
const words = new AVLTree<string>(compare);

// Dates
const dates = new AVLTree<Date>((a, b) => a.getTime() - b.getTime());

// Records ordered by a key, with a tie-breaker
interface IUser {
  name: string;
  id: number;
}
const users = new BSTree<IUser>(
  (a, b) => a.name.localeCompare(b.name) || a.id - b.id,
);
```

Because only the comparator decides equality, `get` and `getOrInsert` can look
up a stored record by a probe that only carries the key:

```typescript
import { AVLTree } from "bstrees";

interface ILevel {
  price: number;
  orders: number[];
}

const book = new AVLTree<ILevel>((a, b) => a.price - b.price);

book.getOrInsert({ price: 10, orders: [] }).orders.push(1);
book.getOrInsert({ price: 10, orders: [] }).orders.push(2);
book.getOrInsert({ price: 12, orders: [] }).orders.push(3);

book.get({ price: 10, orders: [] })?.orders; // [1, 2]
book.min()?.price; // 10 (the lowest price)
```

## API

| Member                                 | Description                                                                      | AVLTree      | BSTree   |
| -------------------------------------- | -------------------------------------------------------------------------------- | ------------ | -------- |
| `new AVLTree<T>(compare?)`             | Creates an empty tree (the comparator is optional for numbers, strings, bigints) | O(1)         | O(1)     |
| `AVLTree.from(values, compare?)`       | Creates a tree from an iterable                                                  | O(n log n)   | O(n·h)   |
| `size`                                 | Number of values                                                                 | O(1)         | O(1)     |
| `height`                               | Edges on the longest root-to-leaf path (`-1` when empty)                         | O(1)         | O(1)     |
| `has(value)`                           | Whether an equal value is stored                                                 | O(log n)     | O(h)     |
| `get(value)`                           | The stored value equal to `value`, or `undefined`                                | O(log n)     | O(h)     |
| `insert(value)`                        | Inserts unless an equal value is stored; returns `true` if inserted              | O(log n)     | O(h)     |
| `getOrInsert(value)`                   | The stored equal value, inserting `value` first if there is none                 | O(log n)     | O(h)     |
| `delete(value)`                        | Removes the equal value; returns `true` if removed                               | O(log n)     | O(h)     |
| `clear()`                              | Removes all values                                                               | O(1)         | O(1)     |
| `min()`, `max()`                       | The smallest / largest value, or `undefined`                                     | O(log n)     | O(h)     |
| `popMin()`, `popMax()`                 | Removes and returns the smallest / largest value                                 | O(log n)     | O(h)     |
| `floor(value)`, `ceil(value)`          | The greatest value `<=` / least value `>=` `value`                               | O(log n)     | O(h)     |
| `lower(value)`, `higher(value)`        | The greatest value `<` / least value `>` `value`                                 | O(log n)     | O(h)     |
| `values()`, `[Symbol.iterator]()`      | Iterates in ascending order                                                      | O(n)         | O(n)     |
| `valuesReversed()`                     | Iterates in descending order                                                     | O(n)         | O(n)     |
| `range({ gt, gte, lt, lte, reverse })` | Iterates over the values within the bounds                                       | O(log n + k) | O(h + k) |
| `forEach(callback, thisArg?)`          | Calls `callback(value, index, tree)` in ascending order                          | O(n)         | O(n)     |
| `toArray()`                            | The values in ascending order                                                    | O(n)         | O(n)     |

`h` is the height of a `BSTree`: about log n for random insertion orders, up to
n for sorted ones, and growing towards √n under many random removals and
insertions. `k` is the number of values in a range.

## Iteration

Iteration always follows the comparator order. Iterators are iterable
themselves, and on Node.js they support the
[iterator helpers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator#iterator_helper_methods):

```typescript
import { AVLTree } from "bstrees";

const tree = AVLTree.from([1, 2, 3, 4, 5, 6]);

[...tree]; // [1, 2, 3, 4, 5, 6]
[...tree.valuesReversed()]; // [6, 5, 4, 3, 2, 1]
[...tree.range({ gt: 2, lte: 5 })]; // [3, 4, 5]
[...tree.range({ lt: 3, reverse: true })]; // [2, 1]
tree
  .values()
  .filter((value) => value % 2 === 0)
  .take(2)
  .toArray(); // [2, 4]
```

A range bound that is missing or `undefined` leaves that side open. Passing
both `gt` and `gte`, or both `lt` and `lte`, throws a `TypeError`.

**Modifying the tree while iterating** is allowed and does not invalidate
iterators. An iterator remembers the last value it returned. After the tree
changes, it continues with the first value past that one that is currently
stored:

- removed values are skipped;
- values inserted ahead of the iterator are visited;
- values inserted behind it are not;
- no value is visited twice.

This differs from a `Set`, whose iterators follow the insertion order: a value
that is deleted and added again, or added after `clear()`, is visited by a
`Set` iterator again, but not by a tree iterator that has already passed it.

Because an iterator finds its place again by comparing with the last value it
returned, do not change the fields the comparator reads of that value while you
still use the iterator, even after removing the value from the tree. For
example, after `tree.delete(value)` keep `value.id` as it is until the
iterator has moved past it or you stop using it.

```typescript
import { AVLTree } from "bstrees";

const tree = AVLTree.from([1, 2, 3, 4, 5]);

for (const value of tree) {
  if (value % 2 === 1) {
    tree.delete(value + 1);
  }
}

tree.toArray(); // [1, 3, 5]
```

## Benchmarks

<!-- Generated by `npm run bench -- --markdown` -->

| Scenario                  | n       | AVLTree      | BSTree       | sorted array | Set           |
| ------------------------- | ------- | ------------ | ------------ | ------------ | ------------- |
| insert (random order)     | 1,000   | 0.17 ms ±0%  | 0.21 ms ±4%  | 0.23 ms ±3%  | 0.022 ms ±3%  |
| insert (random order)     | 10,000  | 2.2 ms ±1%   | 2.5 ms ±1%   | 9.2 ms ±18%  | 0.42 ms ±2%   |
| insert (random order)     | 100,000 | 42 ms ±14%   | 46 ms ±20%   | 631 ms ±17%  | 6.8 ms ±13%   |
| insert (sorted order)     | 1,000   | 0.16 ms ±2%  | 9.2 ms ±1%   | 0.12 ms ±2%  | 0.021 ms ±1%  |
| insert (sorted order)     | 10,000  | 1.7 ms ±1%   | 949 ms ±3%   | 1.7 ms ±4%   | 0.42 ms ±1%   |
| insert (sorted order)     | 100,000 | 22 ms ±5%    | —            | 21 ms ±5%    | 5.4 ms ±4%    |
| has (every value)         | 1,000   | 0.097 ms ±1% | 0.12 ms ±1%  | 0.056 ms ±1% | 0.0069 ms ±3% |
| has (every value)         | 10,000  | 1.6 ms ±3%   | 1.8 ms ±8%   | 3.3 ms ±19%  | 0.18 ms ±1%   |
| has (every value)         | 100,000 | 40 ms ±11%   | 37 ms ±12%   | 34 ms ±4%    | 2.5 ms ±1%    |
| delete (every value)      | 1,000   | 0.17 ms ±0%  | 0.17 ms ±1%  | 0.22 ms ±3%  | 0.032 ms ±2%  |
| delete (every value)      | 10,000  | 2.4 ms ±4%   | 2.3 ms ±1%   | 6.4 ms ±1%   | 0.41 ms ±2%   |
| delete (every value)      | 100,000 | 33 ms ±6%    | 36 ms ±10%   | 799 ms ±32%  | 7.1 ms ±21%   |
| iterate in order          | 1,000   | 0.038 ms ±2% | 0.036 ms ±0% | 0.010 ms ±0% | —             |
| iterate in order          | 10,000  | 0.36 ms ±0%  | 0.40 ms ±1%  | 0.10 ms ±0%  | —             |
| iterate in order          | 100,000 | 3.9 ms ±1%   | 4.4 ms ±4%   | 1.2 ms ±4%   | —             |
| range (1000 × 100 values) | 1,000   | 4.3 ms ±1%   | 4.4 ms ±0%   | 0.25 ms ±0%  | —             |
| range (1000 × 100 values) | 10,000  | 4.4 ms ±1%   | 4.8 ms ±0%   | 0.33 ms ±3%  | —             |
| range (1000 × 100 values) | 100,000 | 5.6 ms ±9%   | 5.5 ms ±2%   | 0.35 ms ±0%  | —             |
| popMin (until empty)      | 1,000   | 0.072 ms ±1% | 0.042 ms ±1% | 0.033 ms ±0% | —             |
| popMin (until empty)      | 10,000  | 0.84 ms ±2%  | 0.58 ms ±0%  | 0.36 ms ±3%  | —             |
| popMin (until empty)      | 100,000 | 10 ms ±3%    | 7.8 ms ±3%   | 1066 ms ±2%  | —             |

Mean time per task and its relative margin of error (95% confidence), measured
with `npm run bench` on an Apple M1 Pro with Node.js 26.11. Treat the numbers
as indicative: they vary between runs and machines, and garbage collection
makes the n = 100 000 rows noisier. Run `npm run bench` to measure on your
machine.

The sorted array uses binary search and `splice`, and its `popMin` uses
`shift()`, which is O(n). `Set` is an unordered baseline. `—` marks skipped
benchmarks: `Set` does not support the ordered scenarios, and a `BSTree` that
receives 100 000 sorted values degrades into a list and takes over a minute.

## Upgrading from 2.x

Version 3 replaces the node-based API with the value-based API above. See
[MIGRATION.md](MIGRATION.md).

## License

[AGPL-3.0-only](LICENSE)
