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
a receiver (`this` is `undefined`). If the comparator throws, the error
propagates and the tree is left unchanged. A result that is not a number, or is
`NaN`, throws a `TypeError`.

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
iterators. An iterator remembers the last value it returned. After the tree changes, it continues with
the first value past that one that is currently stored:

- removed values are skipped;
- values inserted ahead of the iterator are visited;
- values inserted behind it are not;
- no value is visited twice.

This differs from a `Set`, whose iterators follow the insertion order: a value
that is deleted and added again, or added after `clear()`, is visited by a
`Set` iterator again, but not by a tree iterator that has already passed it.

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

| Scenario                  | n       | AVLTree  | BSTree   | sorted array | Set      |
| ------------------------- | ------- | -------- | -------- | ------------ | -------- |
| insert (random order)     | 1,000   | 0.22 ms  | 0.21 ms  | 0.20 ms      | 0.032 ms |
| insert (random order)     | 10,000  | 1.8 ms   | 2.0 ms   | 4.4 ms       | 0.38 ms  |
| insert (random order)     | 100,000 | 24 ms    | 29 ms    | 460 ms       | 3.7 ms   |
| insert (sorted order)     | 1,000   | 0.12 ms  | 7.0 ms   | 0.086 ms     | 0.017 ms |
| insert (sorted order)     | 10,000  | 1.6 ms   | 746 ms   | 1.6 ms       | 1.0 ms   |
| insert (sorted order)     | 100,000 | 18 ms    | —        | 15 ms        | 4.1 ms   |
| has (every value)         | 1,000   | 0.12 ms  | 0.12 ms  | 0.16 ms      | 0.019 ms |
| has (every value)         | 10,000  | 1.4 ms   | 1.7 ms   | 1.9 ms       | 0.20 ms  |
| has (every value)         | 100,000 | 20 ms    | 23 ms    | 24 ms        | 2.5 ms   |
| delete (every value)      | 1,000   | 0.15 ms  | 0.14 ms  | 0.17 ms      | 0.019 ms |
| delete (every value)      | 10,000  | 1.9 ms   | 2.1 ms   | 5.9 ms       | 0.39 ms  |
| delete (every value)      | 100,000 | 30 ms    | 25 ms    | 475 ms       | 3.6 ms   |
| iterate in order          | 1,000   | 0.11 ms  | 0.034 ms | 0.0085 ms    | —        |
| iterate in order          | 10,000  | 0.53 ms  | 0.31 ms  | 0.13 ms      | —        |
| iterate in order          | 100,000 | 4.2 ms   | 3.1 ms   | 0.95 ms      | —        |
| range (1000 × 100 values) | 1,000   | 3.2 ms   | 3.4 ms   | 0.21 ms      | —        |
| range (1000 × 100 values) | 10,000  | 3.4 ms   | 3.4 ms   | 0.24 ms      | —        |
| range (1000 × 100 values) | 100,000 | 4.0 ms   | 3.4 ms   | 0.27 ms      | —        |
| popMin (until empty)      | 1,000   | 0.076 ms | 0.044 ms | 0.043 ms     | —        |
| popMin (until empty)      | 10,000  | 0.61 ms  | 0.46 ms  | 0.26 ms      | —        |
| popMin (until empty)      | 100,000 | 8.2 ms   | 5.8 ms   | 982 ms       | —        |

Mean time per operation batch, measured with `npm run bench` on an Apple M1 Pro
with Node.js 26.11. The sorted array uses binary search and `splice`; `Set` is
an unordered baseline. `BSTree` sorted insertion of 100 000 values is skipped:
it degrades into a list and takes over a minute. Run `npm run bench` to measure
on your machine.

## Upgrading from 2.x

Version 3 replaces the node-based API with the value-based API above. See
[MIGRATION.md](MIGRATION.md).

## License

[AGPL-3.0-only](LICENSE)
