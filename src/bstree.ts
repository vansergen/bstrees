import { SortedTree } from "./sorted-tree.js";
import type { Comparator, ComparatorArgs } from "./types.js";

/**
 * An unbalanced binary search tree.
 *
 * Operations take O(h) time, where `h` is the height of the tree: O(log n) on
 * random input, but O(n) when values are inserted in sorted order. Prefer
 * {@link AVLTree} unless the input order is known to be random.
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
   * bigints.
   */
  public constructor(compare: Comparator<T>);
  public constructor(...args: ComparatorArgs<T>);
  public constructor(compare?: Comparator<T>) {
    super(compare, false);
  }

  /** Creates a tree from numbers, strings or bigints. */
  public static from(values: Iterable<number>): BSTree<number>;
  public static from(values: Iterable<string>): BSTree<string>;
  public static from(values: Iterable<bigint>): BSTree<bigint>;
  /** Creates a tree from any values sorted by `compare`. */
  public static from<T>(values: Iterable<T>, compare: Comparator<T>): BSTree<T>;
  public static from<T>(
    values: Iterable<T>,
    compare?: Comparator<T>,
  ): BSTree<T> {
    return SortedTree.fill(
      new BSTree<T>(...([compare] as ComparatorArgs<T>)),
      values,
    );
  }
}
