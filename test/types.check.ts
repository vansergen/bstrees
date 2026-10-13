/**
 * Type-level tests: this file is only type-checked (`npm run typecheck`).
 */
import {
  AVLTree,
  BSTree,
  type Comparator,
  type SortedTree,
  type TreeIterator,
} from "../src/index.js";

interface IOrder {
  price: number;
}

const byPrice: Comparator<IOrder> = (a, b) => a.price - b.price;

export const numbers = new BSTree<number>();
export const strings = new AVLTree<string>();
export const bigints = BSTree.from([1n, 2n]);
export const literals = new AVLTree<1 | 2>();

// The comparator infers the value type
export const orders = new AVLTree(byPrice);
export const { price }: { price: number } = orders.getOrInsert({ price: 1 });
export const ordersFrom: BSTree<IOrder> = BSTree.from([], byPrice);

// `from()` widens literal types
export const widened: AVLTree<number> = AVLTree.from([1, 2, 3]);

// @ts-expect-error -- objects require a comparator
export const objects = new BSTree<IOrder>();

// @ts-expect-error -- unions of primitives require a comparator
export const mixed = new AVLTree<number | string>();

// @ts-expect-error -- mixed values require a comparator
export const mixedFrom = BSTree.from([1, "a"]);

export const inserted: boolean = numbers.insert(1);
export const deleted: boolean = numbers.delete(1);
export const stored: IOrder = orders.getOrInsert({ price: 1 });
export const found: IOrder | undefined = orders.get({ price: 1 });
export const min: number | undefined = numbers.min();

// @ts-expect-error -- `min()` returns `undefined` for an empty tree
export const definitelyMin: number = numbers.min();

export const either: SortedTree<number>[] = [numbers, widened];
export const values: TreeIterator<string> = strings.values();
export const doubled: number[] = numbers
  .values()
  .map((value) => value * 2)
  .toArray();

// @ts-expect-error -- `gt` must have the value type
export const range = numbers.range({ gt: "1" });

// @ts-expect-error -- `Node` is not exported anymore
export type RemovedNode = import("../src/index.js").Node;
