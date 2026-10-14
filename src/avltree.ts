import { SortedTree } from "./sorted-tree.js";
import type { Comparator, ComparatorArgs } from "./types.js";

/**
 * A self-balancing (AVL) binary search tree.
 *
 * Lookups, insertions and removals take O(log n) time in the worst case.
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
  public static from(values: Iterable<number>): AVLTree<number>;
  public static from(values: Iterable<string>): AVLTree<string>;
  public static from(values: Iterable<bigint>): AVLTree<bigint>;
  /** Creates a tree from any values sorted by `compare`. */
  public static from<T>(
    values: Iterable<T>,
    compare: Comparator<T>,
  ): AVLTree<T>;
  /**
   * Creates a tree from bigints of an explicit type, also in generic code
   * (`AVLTree.from<T>(values)` with `T extends bigint`).
   */
  public static from<T extends bigint>(
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T>;
  /**
   * Creates a tree from numbers of an explicit type, such as
   * `AVLTree.from<1 | 2>([1, 2])`, also in generic code
   * (`AVLTree.from<T>(values)` with `T extends number`).
   */
  public static from<T extends number>(
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T>;
  /**
   * Creates a tree from strings of an explicit type, also in generic code
   * (`AVLTree.from<T>(values)` with `T extends string`).
   */
  public static from<T extends string>(
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T>;
  public static from<T>(
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): AVLTree<T> {
    return SortedTree.fill(
      new AVLTree<T>(...([compare] as ComparatorArgs<T>)),
      values,
    );
  }
}
