import { SortedTree } from "./sorted-tree.js";
import type { Comparator, ComparatorArgs } from "./types.js";

/**
 * An unbalanced binary search tree.
 *
 * Operations take O(h) time, where `h` is the height of the tree: O(log n) on
 * random input, but O(n) when values are inserted in sorted order. Many random
 * removals mixed with insertions also make it deeper over time. Prefer
 * {@link AVLTree} unless the input order is known to be random.
 *
 * Like `Array.from`, `from()` called on a subclass creates an instance of
 * that subclass. TypeScript requires the subclass constructor to accept the
 * comparator as its only argument and the values to match the subclass type.
 *
 * @example
 * ```ts
 * const tree = new BSTree<number>();
 * tree.insert(3);
 * tree.insert(1);
 * tree.toArray(); // [1, 3]
 * ```
 */
export class BSTree<T> extends SortedTree<T> {
  /**
   * @param compare - The sort order. Optional only for numbers, strings and
   * bigints. In generic code where TypeScript cannot tell that `T` is one of
   * them (`T extends number`), pass a comparator or create the tree with
   * `BSTree.from<T>([])`.
   * @throws {TypeError} If `compare` is neither a function nor `undefined`.
   */
  public constructor(compare: Comparator<T>);
  public constructor(...args: ComparatorArgs<T>);
  public constructor(compare?: Comparator<T>) {
    super(compare, false);
  }

  /** Creates a tree from numbers, strings or bigints. */
  public static from(
    this: new (compare?: Comparator<number>) => BSTree<number>,
    values: Iterable<number>,
  ): BSTree<number>;
  public static from(
    this: new (compare?: Comparator<string>) => BSTree<string>,
    values: Iterable<string>,
  ): BSTree<string>;
  public static from(
    this: new (compare?: Comparator<bigint>) => BSTree<bigint>,
    values: Iterable<bigint>,
  ): BSTree<bigint>;
  /** Creates a tree from any values sorted by `compare`. */
  public static from<T>(
    this: NoInfer<new (compare: Comparator<T>) => BSTree<T>>,
    values: Iterable<T>,
    compare: Comparator<T>,
  ): BSTree<T>;
  /**
   * Creates a tree from bigints of an explicit type, also in generic code
   * (`BSTree.from<T>(values)` with `T extends bigint`).
   */
  public static from<T extends bigint>(
    this: NoInfer<new (compare?: Comparator<T>) => BSTree<T>>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): BSTree<T>;
  /**
   * Creates a tree from numbers of an explicit type, such as
   * `BSTree.from<1 | 2>([1, 2])`, also in generic code
   * (`BSTree.from<T>(values)` with `T extends number`).
   */
  public static from<T extends number>(
    this: NoInfer<new (compare?: Comparator<T>) => BSTree<T>>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): BSTree<T>;
  /**
   * Creates a tree from strings of an explicit type, also in generic code
   * (`BSTree.from<T>(values)` with `T extends string`).
   */
  public static from<T extends string>(
    this: NoInfer<new (compare?: Comparator<T>) => BSTree<T>>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): BSTree<T>;
  public static from<T>(
    this: new (compare?: Comparator<T>) => BSTree<T>,
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): BSTree<T> {
    return SortedTree.fill(new this(compare), values);
  }
}
