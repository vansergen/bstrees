# bstrees ![CI Status](https://github.com/vansergen/bstrees/workflows/CI/badge.svg) [![version](https://img.shields.io/github/package-json/v/vansergen/bstrees?style=plastic)](https://github.com/vansergen/bstrees) [![Known Vulnerabilities](https://snyk.io/test/github/vansergen/bstrees/badge.svg)](https://snyk.io/test/github/vansergen/bstrees) [![Coverage Status](https://coveralls.io/repos/github/vansergen/bstrees/badge.svg?branch=main)](https://coveralls.io/github/vansergen/bstrees?branch=main) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![GitHub top language](https://img.shields.io/github/languages/top/vansergen/bstrees) ![node version](https://img.shields.io/node/v/bstrees) ![npm downloads](https://img.shields.io/npm/dt/bstrees) ![License](https://img.shields.io/github/license/vansergen/bstrees)

A simple library to store data in binary search trees.

## Installation

```bash
npm install bstrees
```

## Usage

### `BSTree`

A simple binary search tree

```typescript
import { BSTree } from "bstrees";

interface IOrder {
  id: number;
  amount: number[];
}

interface IOrders {
  price: number;
  orders: IOrder[];
}

const orders = new BSTree<IOrders>((a, b) => a.price - b.price);
const {
  data: { orders: current },
} = orders.insert({ price: 3, orders: [] });
current.push({ id: 1, amount: 2 });
console.log(orders.array);
```

- `.insert()`

```typescript
const tree = new BSTree<number>();
tree.insert(3);
tree.insert(5);
tree.insert(1);
tree.insert(0);
tree.insert(4);
tree.insert(6);
```

- `.find()`

```typescript
const tree = new BSTree<number>();
tree.insert(3);
console.log(tree.find(2)?.data);
console.log(tree.find(3)?.data);
console.log(tree.find(2, { upsert: true })?.data);
```

- `.delete()`

```typescript
const tree = new BSTree<number>();
tree.insert(3);
tree.insert(5);
tree.insert(1);
tree.delete(3);
```

- `.array()`

```typescript
const tree = new BSTree<number>();
tree.insert(3);
tree.insert(5);
tree.insert(1);
console.log(...tree.array);
```

- `.from()`

```typescript
const tree = BSTree.from()([3, 5, 1, 4, 0, 6]);
console.log(...tree.array);
```

### Coverage

```bash
npm run coverage:ci
```
