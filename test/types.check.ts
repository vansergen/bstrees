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

// An explicit type argument keeps literal types
export const explicit: AVLTree<1 | 2> = AVLTree.from<1 | 2>([1, 2]);
export const explicitBigints: BSTree<bigint> = BSTree.from<bigint>([1n]);

// @ts-expect-error -- unions of primitives require a comparator
export const explicitMixed = BSTree.from<number | string>([1, "a"]);

// Generic code over primitive types uses `from<T>()`
export function numbersOf<T extends number>(values: T[]): AVLTree<T>[] {
  return [AVLTree.from<T>(values), AVLTree.from<T>([])];
}
export function stringsOf<T extends string>(values: T[]): BSTree<T> {
  return BSTree.from<T>(values);
}
export function bigintsOf<T extends bigint>(values: T[]): BSTree<T> {
  return BSTree.from<T>(values, (a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
export function emptyOf<T extends number>(): AVLTree<T> {
  // @ts-expect-error -- in generic code the constructor needs a comparator
  return new AVLTree<T>();
}

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

// A bound may be `undefined` explicitly, even with `exactOptionalPropertyTypes`
export function between(
  from: number | undefined,
  to: number | undefined,
  reverse: boolean | undefined,
): TreeIterator<number> {
  return numbers.range({ gte: from, lt: to, reverse });
}

// `from()` called on a subclass passes the comparator to its constructor
class NumberTree extends AVLTree<number> {}
class NamedTree extends BSTree<number> {
  public readonly label: string;

  public constructor(label: string) {
    super();
    this.label = label;
  }
}
class OrderTree extends BSTree<IOrder> {}

export const fromSubclass: AVLTree<number> = NumberTree.from([2, 1]);
export const fromSubclassWithCompare: AVLTree<number> = NumberTree.from(
  [2, 1],
  (a, b) => b - a,
);
export const ordersSubclass: BSTree<IOrder> = OrderTree.from(
  [{ price: 1 }],
  byPrice,
);

// @ts-expect-error -- a subclass of number trees cannot hold strings
export const wrongValues = NumberTree.from(["a"]);

const byText: Comparator<string> = (a, b) => a.localeCompare(b);

// @ts-expect-error -- not even with a comparator
export const wrongValuesWithCompare = NumberTree.from(["a"], byText);

// @ts-expect-error -- the constructor does not accept a comparator
export const wrongConstructor = NamedTree.from([1]);

// @ts-expect-error -- a tree of objects still needs a comparator
export const ordersNoCompare = OrderTree.from([{ price: 1 }]);

const byString: Comparator<number | string> = (a, b) =>
  String(a).localeCompare(String(b));

// @ts-expect-error -- not even with an explicit type argument
export const wrongUnion = NumberTree.from<number | string>(["a"], byString);

// @ts-expect-error -- a tree of literals is not a tree of numbers
export const literalsAsNumbers: SortedTree<number> = explicit;

// The values give the comparator parameters their types
export const descending = AVLTree.from([1, 2], (a, b) => b - a);
export const words = BSTree.from(["b", "a"], (a, b) => a.localeCompare(b));
export const prices = AVLTree.from([{ price: 2 }], (a, b) => a.price - b.price);
export function descendingOf<T extends number>(items: T[]): AVLTree<T> {
  return AVLTree.from<T>(items, (a, b) => b - a);
}
