import type { TreeCore } from "./internal/core.js";
import { predecessor, successor } from "./internal/node.js";
import type { RangeOptions } from "./types.js";

interface IBound<T> {
  readonly value: T;
  readonly inclusive: boolean;
}

/** A validated {@link RangeOptions} object. */
export interface IRange<T> {
  readonly lower: IBound<T> | null;
  readonly upper: IBound<T> | null;
  readonly reverse: boolean;
}

function toBound<T>(
  exclusive: T | undefined,
  inclusive: T | undefined,
  names: string,
): IBound<T> | null {
  if (typeof exclusive !== "undefined") {
    if (typeof inclusive !== "undefined") {
      throw new TypeError(`${names} cannot be used together`);
    }

    return { value: exclusive, inclusive: false };
  }

  return typeof inclusive === "undefined"
    ? null
    : { value: inclusive, inclusive: true };
}

export function toRange<T>({
  gt,
  gte,
  lt,
  lte,
  reverse = false,
}: RangeOptions<T> = {}): IRange<T> {
  return {
    lower: toBound(gt, gte, "`gt` and `gte`"),
    upper: toBound(lt, lte, "`lt` and `lte`"),
    reverse,
  };
}

/**
 * Iterates over the values of a tree within a range.
 *
 * It tolerates mutations: after the tree changes, the next value is looked up
 * again as the first one past the last yielded value.
 * Removed values are skipped and values inserted ahead of the iterator are
 * visited. Nothing is yielded twice.
 *
 * The position is the last yielded value itself, so the caller must not
 * change the fields the comparator reads of that value while the iterator is
 * in use, even after removing it from the tree.
 */
export function* iterate<T>(
  core: TreeCore<T>,
  { lower, upper, reverse }: IRange<T>,
): Generator<T, undefined, unknown> {
  const start = reverse ? upper : lower;
  const end = reverse ? lower : upper;
  const direction = reverse ? -1 : 1;
  let { version } = core;
  let node = start
    ? core.bound(start.value, reverse, start.inclusive)
    : reverse
      ? core.last()
      : core.first();

  while (node) {
    const { value } = node;

    if (end) {
      const order = core.compare(value, end.value) * direction;

      if (order > 0 || (order === 0 && !end.inclusive)) {
        return;
      }
    }

    yield value;

    if (core.version === version) {
      node = reverse ? predecessor(node) : successor(node);
    } else {
      ({ version } = core);
      node = core.bound(value, reverse, false);
    }
  }
}
