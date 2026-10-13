# Migrating from 2.x to 3.0

Version 3 replaces the node-based API with a value-based, `Set`-like API.

Nodes were public and mutable, so code could corrupt a tree by accident. They
are now internal, and every method takes and returns values.

The published 2.0.0 package was also broken: its tarball was missing the
compiled sources. If you used 1.x, the changes below apply as well.

## Requirements

- Node.js 24 or newer.
- The package is ES-module only. `require("bstrees")` keeps working through
  Node.js `require(esm)`.
- Only the package root (`"bstrees"`) can be imported. Deep imports such as
  `bstrees/dist/src/node.js` are blocked by the `exports` map.
- TypeScript 5.6 or newer for the type definitions.

## API changes

| 2.x                                                             | 3.0                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `tree.find(value)?.data`                                        | `tree.get(value)`                                                                            |
| `tree.find(value) !== null`                                     | `tree.has(value)`                                                                            |
| `tree.find(value, { upsert: true }).data`                       | `tree.getOrInsert(value)`                                                                    |
| `tree.insert(value)` returns a `Node`                           | `tree.insert(value)` returns `true` if inserted, `false` if an equal value is already stored |
| `tree.delete(value)` returns `{ node, success }`                | `tree.delete(value)` returns `true` if removed                                               |
| `for (const node of tree) node.data`                            | `for (const value of tree) value`                                                            |
| `tree.array`                                                    | `tree.toArray()` or `[...tree]`                                                              |
| `tree.min?.data`, `tree.max?.data` (getters)                    | `tree.min()`, `tree.max()`                                                                   |
| `tree.size`, `tree.height`                                      | unchanged, but now O(1)                                                                      |
| `tree.width`                                                    | removed                                                                                      |
| `IComparator<T>`                                                | `Comparator<T>`                                                                              |
| `AVLTree extends BSTree`                                        | both extend `SortedTree<T>`; `avl instanceof BSTree` is `false`                              |
| `Node`, `TreeIterator`, `INodeDeleteResult`, `INodeFindOptions` | removed                                                                                      |
| `BSTree.getDir`, `AVLTree.heightBalance`, `AVLTree.isAVL`       | removed                                                                                      |

New in 3.0:

- `clear()`, `popMin()`, `popMax()`;
- `floor()`, `ceil()`, `lower()`, `higher()`;
- `valuesReversed()`, `range()`, `forEach()`;
- iterator helpers;
- iteration that tolerates modifications of the tree.

## Comparator changes

The default comparator now accepts only numbers, strings and bigints of the
same type. It throws a `TypeError` for anything else:

- **`NaN`**: before, `NaN` compared equal to every value, so `delete(NaN)`
  silently removed an unrelated value.
- **Values of different types**, such as `1` and `"1"`.
- **Objects**: before, all objects compared equal, so a tree of objects without
  a comparator held only one of them.

Pass a comparator for any other values. In TypeScript, `new BSTree<T>()`
without a comparator only compiles when `T` is `number`, `string` or `bigint`:

```typescript
// 2.x
const tree = new BSTree<{ id: number }>();

// 3.0
const tree = new BSTree<{ id: number }>((a, b) => a.id - b.id);
```

A custom comparator that returns `NaN` (or anything that is not a number) now
throws a `TypeError` instead of corrupting the tree.

## Behavior fixes

- `AVLTree` stays balanced on every insertion path. In 2.x,
  `find(value, { upsert: true })` skipped rebalancing.
- `AVLTree` deletions take O(log n) instead of O(n).
- Removing or inserting values while iterating no longer ends the iteration
  early.

## Example

```typescript
// 2.x
import { AVLTree } from "bstrees";

const book = new AVLTree<{ price: number; orders: number[] }>(
  (a, b) => a.price - b.price,
);
book.find({ price: 10, orders: [] }, { upsert: true }).data.orders.push(1);
for (const { data } of book) {
  console.log(data.price);
}
```

```typescript
// 3.0
import { AVLTree } from "bstrees";

const book = new AVLTree<{ price: number; orders: number[] }>(
  (a, b) => a.price - b.price,
);
book.getOrInsert({ price: 10, orders: [] }).orders.push(1);
for (const { price } of book) {
  console.log(price);
}
```
