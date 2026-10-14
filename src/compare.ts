import type { Comparator } from "./types.js";

function isComparable(value: unknown): value is bigint | number | string {
  return (
    typeof value === "bigint" ||
    typeof value === "string" ||
    (typeof value === "number" && !Number.isNaN(value))
  );
}

function order<T>(a: T, b: T): number {
  if (a < b) {
    return -1;
  }

  return a > b ? 1 : 0;
}

/**
 * The comparator used when none is passed to a tree constructor. It orders
 * numbers, strings and bigints of the same type and throws otherwise.
 */
export function defaultCompare(a: unknown, b: unknown): number {
  if (!isComparable(a) || !isComparable(b) || typeof a !== typeof b) {
    throw new TypeError(
      "The default comparator supports only numbers (except NaN), strings " +
        "and bigints of the same type. Pass a comparator to the tree constructor.",
    );
  }

  return order(a, b);
}

/** Names the type of an invalid value in an error message. */
export function typeName(value: unknown): string {
  if (value === null) {
    return "null";
  }

  return Number.isNaN(value) ? "NaN" : typeof value;
}

/**
 * Returns the comparator a tree uses: `compare`, or the default comparator
 * when it is `undefined`.
 *
 * @throws {TypeError} If `compare` is not a function.
 */
export function toComparator<T>(compare: unknown): Comparator<T> {
  if (typeof compare === "undefined") {
    return defaultCompare;
  }

  if (typeof compare !== "function") {
    throw new TypeError(
      `The comparator must be a function, got ${typeName(compare)}`,
    );
  }

  return compare as Comparator<T>;
}
