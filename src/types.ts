/**
 * Defines the sort order of a tree.
 *
 * Returns a negative number when `a` sorts before `b`, a positive number when
 * `a` sorts after `b` and zero when they are equal. It must be a consistent
 * total order (reflexive, antisymmetric and transitive) and must never return
 * `NaN`. The tree may call it with its arguments in either order.
 *
 * It must not modify the tree it orders: a mutating method of that tree called
 * from the comparator throws a `TypeError` and leaves the tree unchanged.
 * Reading the tree or modifying other trees is allowed.
 *
 * @example
 * ```ts
 * const byPrice: Comparator<{ price: number }> = (a, b) => a.price - b.price;
 * ```
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Bounds for {@link SortedTree.range}. A missing (or `undefined`) bound leaves
 * that side of the range open.
 */
export interface RangeOptions<T> {
  /** Only values greater than this one. Cannot be combined with `gte`. */
  readonly gt?: T | undefined;
  /** Only values greater than or equal to this one. Cannot be combined with `gt`. */
  readonly gte?: T | undefined;
  /** Only values less than this one. Cannot be combined with `lte`. */
  readonly lt?: T | undefined;
  /** Only values less than or equal to this one. Cannot be combined with `lt`. */
  readonly lte?: T | undefined;
  /** Iterate from the largest value to the smallest one. Defaults to `false`. */
  readonly reverse?: boolean | undefined;
}

/**
 * An iterator over the values of a tree. It is iterable itself and supports
 * the iterator helpers (`map`, `filter`, `take`, `toArray`, ...).
 */
export type TreeIterator<T> = IteratorObject<T, undefined>;

/**
 * Constructor arguments of a tree: the comparator is optional only when the
 * values are numbers, strings or bigints.
 */
export type ComparatorArgs<T> = [T] extends [bigint] | [number] | [string]
  ? [compare?: Comparator<T>]
  : [compare: Comparator<T>];
