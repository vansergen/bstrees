import { toComparator } from "./compare.js";
import { TreeCore } from "./internal/core.js";
import { iterate, toRange } from "./iterator.js";
import type { Comparator, RangeOptions, TreeIterator } from "./types.js";

/**
 * Test-only access to the internals of a tree.
 *
 * @internal
 */
// eslint-disable-next-line init-declarations -- assigned in the static block of `SortedTree`
export let getCore: <T>(tree: SortedTree<T>) => TreeCore<T>;

/**
 * A sorted collection of unique values, ordered by a {@link Comparator}.
 * {@link BSTree} and {@link AVLTree} share this API; use this type to accept
 * either of them.
 *
 * Values are unique with respect to the comparator: inserting a value equal to
 * a stored one keeps the stored one. Iteration yields values in ascending
 * order.
 *
 * Every method that takes a value passes it to the comparator, even when the
 * tree is empty, so a value the comparator rejects (such as `NaN` with the
 * default comparator) throws whether the tree is empty or not.
 *
 * The comparator must not modify the tree it orders: the mutating methods
 * (`insert`, `getOrInsert`, `delete`, `clear`, `popMin` and `popMax`)
 * throw a `TypeError` when the comparator calls them, and leave the tree
 * unchanged.
 */
export abstract class SortedTree<T> implements Iterable<T> {
  readonly #core: TreeCore<T>;

  static {
    getCore = <U>(tree: SortedTree<U>): TreeCore<U> => tree.#core;
  }

  /** @internal */
  protected constructor(compare: Comparator<T> | undefined, balanced: boolean) {
    this.#core = new TreeCore(toComparator<T>(compare), balanced);
  }

  /** The number of values in the tree. O(1). */
  public get size(): number {
    return this.#core.size;
  }

  /**
   * The number of edges on the longest path from the root to a leaf: `-1` for
   * an empty tree and `0` for a tree with a single value. O(1).
   */
  public get height(): number {
    return (this.#core.root?.height ?? 0) - 1;
  }

  /**
   * Checks whether the tree contains a value equal to `value`.
   *
   * @throws {TypeError} If the comparator rejects the value.
   */
  public has(value: T): boolean {
    return this.#core.find(value) !== null;
  }

  /**
   * Returns the stored value equal to `value`. Useful when the comparator only
   * looks at a key: pass a probe with that key to get the stored record.
   *
   * @example
   * ```ts
   * const users = new AVLTree<{ id: number; name: string }>((a, b) => a.id - b.id);
   * users.insert({ id: 1, name: "Alice" });
   * users.get({ id: 1, name: "" })?.name; // "Alice"
   * ```
   * @throws {TypeError} If the comparator rejects the value.
   */
  public get(value: T): T | undefined {
    return this.#core.find(value)?.value;
  }

  /**
   * Inserts `value` unless an equal value is already stored (that value is
   * kept as is).
   *
   * @returns `true` if the value was inserted.
   * @throws {TypeError} If the comparator rejects the value.
   */
  public insert(value: T): boolean {
    this.#core.assertMutable();
    const { size } = this.#core;
    this.#core.insert(value);
    return this.#core.size !== size;
  }

  /**
   * Returns the stored value equal to `value`, inserting `value` first if
   * there is none.
   *
   * @example
   * ```ts
   * const book = new AVLTree<{ price: number; orders: number[] }>(
   *   (a, b) => a.price - b.price,
   * );
   * book.getOrInsert({ price: 10, orders: [] }).orders.push(1);
   * book.getOrInsert({ price: 10, orders: [] }).orders.push(2);
   * book.get({ price: 10, orders: [] })?.orders; // [1, 2]
   * ```
   * @throws {TypeError} If the comparator rejects the value.
   */
  public getOrInsert(value: T): T {
    this.#core.assertMutable();
    return this.#core.insert(value).value;
  }

  /**
   * Removes the value equal to `value`.
   *
   * @returns `true` if a value was removed.
   * @throws {TypeError} If the comparator rejects the value.
   */
  public delete(value: T): boolean {
    this.#core.assertMutable();
    const node = this.#core.find(value);

    if (!node) {
      return false;
    }

    this.#core.remove(node);
    return true;
  }

  /** Removes all values. */
  public clear(): void {
    this.#core.assertMutable();
    this.#core.clear();
  }

  /** Returns the smallest value, or `undefined` if the tree is empty. */
  public min(): T | undefined {
    return this.#core.first()?.value;
  }

  /** Returns the largest value, or `undefined` if the tree is empty. */
  public max(): T | undefined {
    return this.#core.last()?.value;
  }

  /** Removes and returns the smallest value. */
  public popMin(): T | undefined {
    this.#core.assertMutable();
    const node = this.#core.first();

    if (node) {
      this.#core.remove(node);
    }

    return node?.value;
  }

  /** Removes and returns the largest value. */
  public popMax(): T | undefined {
    this.#core.assertMutable();
    const node = this.#core.last();

    if (node) {
      this.#core.remove(node);
    }

    return node?.value;
  }

  /**
   * Returns the greatest value less than or equal to `value`.
   *
   * @throws {TypeError} If the comparator rejects the value.
   */
  public floor(value: T): T | undefined {
    return this.#core.bound(value, true, true)?.value;
  }

  /**
   * Returns the least value greater than or equal to `value`.
   *
   * @throws {TypeError} If the comparator rejects the value.
   */
  public ceil(value: T): T | undefined {
    return this.#core.bound(value, false, true)?.value;
  }

  /**
   * Returns the greatest value strictly less than `value`.
   *
   * @throws {TypeError} If the comparator rejects the value.
   */
  public lower(value: T): T | undefined {
    return this.#core.bound(value, true, false)?.value;
  }

  /**
   * Returns the least value strictly greater than `value`.
   *
   * @throws {TypeError} If the comparator rejects the value.
   */
  public higher(value: T): T | undefined {
    return this.#core.bound(value, false, false)?.value;
  }

  /**
   * Iterates over the values in ascending order.
   *
   * The tree may be modified during the iteration: removed values are
   * skipped, values inserted ahead of the iterator are visited and values
   * inserted behind it are not. Unlike with a `Set`, a value is never visited
   * twice, even if it is deleted and inserted again.
   *
   * After the tree changes, the iterator finds its place again by comparing
   * with the last value it returned. While you use the iterator, do not change
   * the fields the comparator reads of that value, even after removing it from
   * the tree.
   */
  public values(): TreeIterator<T> {
    return iterate(this.#core, toRange());
  }

  /**
   * Iterates over the values in descending order. Modifications during the
   * iteration follow the same rules as for {@link SortedTree.values}.
   */
  public valuesReversed(): TreeIterator<T> {
    return iterate(this.#core, toRange({ reverse: true }));
  }

  /**
   * Iterates over the values within the bounds, in ascending order unless
   * `reverse` is set. Modifications during the iteration follow the same rules
   * as for {@link SortedTree.values}.
   *
   * @example
   * ```ts
   * const tree = AVLTree.from([1, 2, 3, 4, 5]);
   * [...tree.range({ gte: 2, lt: 4 })]; // [2, 3]
   * [...tree.range({ gt: 3, reverse: true })]; // [5, 4]
   * ```
   * @throws {TypeError} If both `gt` and `gte` (or `lt` and `lte`) are set,
   * or if the comparator rejects a bound. When `range` is called, each bound
   * is compared with itself and, if the tree is not empty, with a stored value,
   * so an invalid bound throws before the iteration starts.
   */
  public range(options?: RangeOptions<T>): TreeIterator<T> {
    const range = toRange(options);

    for (const bound of [range.lower, range.upper]) {
      if (bound) {
        this.#core.checkBound(bound.value);
      }
    }

    return iterate(this.#core, range);
  }

  /** Same as {@link SortedTree.values}. */
  public [Symbol.iterator](): TreeIterator<T> {
    return this.values();
  }

  /** Calls `callback` for every value in ascending order. */
  public forEach(
    callback: (value: T, index: number, tree: this) => void,
    thisArg?: unknown,
  ): void {
    let index = 0;

    for (const value of this) {
      callback.call(thisArg, value, index, this);
      index += 1;
    }
  }

  /** Returns the values in ascending order. */
  public toArray(): T[] {
    return [...this];
  }

  /** Inserts every value of `values` into `tree`. */
  protected static fill<T, R extends SortedTree<T>>(
    tree: R,
    values: Iterable<T>,
  ): R {
    for (const value of values) {
      tree.insert(value);
    }

    return tree;
  }
}
