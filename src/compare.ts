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
