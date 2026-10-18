import { SortedTree } from "./sorted-tree.js";
import type { Comparator, ComparatorArgs } from "./types.js";

/**
 * A self-balancing (AVL) binary search tree.
 *
 * Lookups, insertions and removals take O(log n) time in the worst case.
 *
 * Like `Array.from`, `from()` called on a subclass creates an instance of
 * that subclass. TypeScript requires the subclass constructor to accept the
 * comparator as its only argument and the values to match the subclass type.
 *
 * @example
 * ```ts
 * const tree = new AVLTree<number>();
 * tree.insert(3);
 * tree.insert(1);
 * tree.toArray(); // [1, 3]
 * ```
 */
export class AVLTree<T> extends SortedTree<T> {
  /**
   * @param compare - The sort order. Optional only for numbers, strings and
   * bigints. In generic code where TypeScript cannot tell that `T` is one of
   * them (`T extends number`), pass a comparator or create the tree with
   * `AVLTree.from<T>([])`.
   * @throws {TypeError} If `compare` is neither a function nor `undefined`.
   */
  public constructor(compare: Comparator<T>);
  public constructor(...args: ComparatorArgs<T>);
  public constructor(compare?: Comparator<T>) {
    super(compare, true);
  }

  /** Creates a tree from numbers, strings or bigints. */
  public static from(
    this: new (compare?: Comparator<number>) => AVLTree<number>,
    values: Iterable<number>,
  ): AVLTree<number>;
  public static from(
    this: new (compare?: Comparator<string>) => AVLTree<string>,
    values: Iterable<string>,
  ): AVLTree<string>;
  public static from(
    this: new (compare?: Comparator<bigint>) => AVLTree<bigint>,
    values: Iterable<bigint>,
  ): AVLTree<bigint>;
  /** Creates a tree from any values sorted by `compare`. */
  public static from<T>(
    this: NoInfer<new (compare: Comparator<T>) => AVLTree<T>>,
    values: Iterable<T>,
    compare: Comparator<T>,
  ): AVLTree<T>;
  /**
   * Creates a tree from bigints of an explicit type, also in generic code
   * (`AVLTree.from<T>(values)` with `T extends bigint`).
   */
  public static from<T extends bigint>(
    this: NoInfer<new (compare?: Comparator<T>) => AVLTree<T>>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T>;
  /**
   * Creates a tree from numbers of an explicit type, such as
   * `AVLTree.from<1 | 2>([1, 2])`, also in generic code
   * (`AVLTree.from<T>(values)` with `T extends number`).
   */
  public static from<T extends number>(
    this: NoInfer<new (compare?: Comparator<T>) => AVLTree<T>>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T>;
  /**
   * Creates a tree from strings of an explicit type, also in generic code
   * (`AVLTree.from<T>(values)` with `T extends string`).
   */
  public static from<T extends string>(
    this: NoInfer<new (compare?: Comparator<T>) => AVLTree<T>>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T>;
  public static from<T>(
    this: new (compare?: Comparator<T>) => AVLTree<T>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T> {
    return SortedTree.fill(new this(compare), values);
  }
}
