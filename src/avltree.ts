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
   * bigints.
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
