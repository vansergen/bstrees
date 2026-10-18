/* eslint-disable @typescript-eslint/no-floating-promises */
import { deepEqual, equal, ok } from "node:assert/strict";
import { describe, it } from "node:test";

import fc from "fast-check";

import {
  AVLTree,
  BSTree,
  type Comparator,
  type RangeOptions,
  type SortedTree,
  type TreeIterator,
} from "../src/index.js";
import { assertInvariants } from "./helpers/invariants.js";

type Operation =
  | { type: "clear" | "popMax" | "popMin" }
  | { type: "delete" | "getOrInsert" | "insert" | "query"; value: number }
  | { type: "range"; options: RangeOptions<number> };

type Step =
  | { type: "clear" }
  | { type: "delete" | "insert"; value: number }
  | { type: "next"; iterator: number };

interface ICursor {
  readonly options: RangeOptions<number>;
  readonly iterator: TreeIterator<number>;
  last: number | null;
  done: boolean;
}

type Create = (
  compare: Comparator<number>,
  values?: Iterable<number>,
) => SortedTree<number>;

const kinds: [string, Create][] = [
  [
    "BSTree",
    (compare, values = []): SortedTree<number> => BSTree.from(values, compare),
  ],
  [
    "AVLTree",
    (compare, values = []): SortedTree<number> => AVLTree.from(values, compare),
  ],
];

const orders: [string, Comparator<number>][] = [
  ["ascending", (a, b): number => a - b],
  ["descending", (a, b): number => b - a],
];

// Small values make collisions (and therefore no-op inserts/deletes) likely.
const value = fc.integer({ max: 30, min: -30 });

const bound = fc.option(fc.tuple(value, fc.boolean()), { nil: null });

const rangeOptions: fc.Arbitrary<RangeOptions<number>> = fc
  .tuple(bound, bound, fc.boolean())
  .map(([lower, upper, reverse]) => ({
    ...(lower ? (lower[1] ? { gte: lower[0] } : { gt: lower[0] }) : {}),
    ...(upper ? (upper[1] ? { lte: upper[0] } : { lt: upper[0] }) : {}),
    reverse,
  }));

const operation: fc.Arbitrary<Operation> = fc.oneof(
  {
    arbitrary: fc.record({ type: fc.constant("insert"), value }),
    weight: 6,
  },
  {
    arbitrary: fc.record({ type: fc.constant("delete"), value }),
    weight: 4,
  },
  {
    arbitrary: fc.record({ type: fc.constant("getOrInsert"), value }),
    weight: 2,
  },
  { arbitrary: fc.record({ type: fc.constant("query"), value }), weight: 3 },
  {
    arbitrary: fc.record({ options: rangeOptions, type: fc.constant("range") }),
    weight: 2,
  },
  { arbitrary: fc.record({ type: fc.constant("popMin") }), weight: 1 },
  { arbitrary: fc.record({ type: fc.constant("popMax") }), weight: 1 },
  { arbitrary: fc.record({ type: fc.constant("clear") }), weight: 1 },
);

const step: fc.Arbitrary<Step> = fc.oneof(
  {
    arbitrary: fc.record({
      iterator: fc.nat({ max: 2 }),
      type: fc.constant("next"),
    }),
    weight: 6,
  },
  { arbitrary: fc.record({ type: fc.constant("insert"), value }), weight: 2 },
  { arbitrary: fc.record({ type: fc.constant("delete"), value }), weight: 2 },
  // Rare, so that a refilled tree is iterated again before the next clear
  { arbitrary: fc.record({ type: fc.constant("clear") }), weight: 1 },
);

// By default fast-check caps arrays at about 10 items whatever `maxLength` is,
// so `size: "max"` and `minLength` are needed for long sequences.
const operations = fc.array(operation, {
  maxLength: 200,
  minLength: 50,
  size: "max",
});
const initialValues = fc.array(value, { maxLength: 40, size: "max" });
const steps = fc.array(step, { maxLength: 120, minLength: 30, size: "max" });
const iteratorOptions = fc.array(rangeOptions, { maxLength: 3, minLength: 1 });

/** The longest sequences the tests must reach to exercise deep trees. */
const longEnough = { initial: 30, operations: 150, steps: 90 };

/** An array of unique numbers sorted by a comparator, mirroring a tree. */
class Model {
  public values: number[] = [];
  readonly #compare: Comparator<number>;

  public constructor(compare: Comparator<number>, values: number[] = []) {
    this.#compare = compare;

    for (const item of values) {
      this.insert(item);
    }
  }

  public has(item: number): boolean {
    return this.values.includes(item);
  }

  public insert(item: number): boolean {
    if (this.has(item)) {
      return false;
    }

    this.values = [...this.values, item].sort(this.#compare);
    return true;
  }

  public delete(item: number): boolean {
    const { length } = this.values;
    this.values = this.values.filter((other) => other !== item);
    return this.values.length !== length;
  }

  /** Whether `item` comes after `other` in the given direction. */
  public after(item: number, other: number, reverse: boolean): boolean {
    const order = this.#compare(item, other);
    return reverse ? order < 0 : order > 0;
  }

  public range({ gt, gte, lt, lte, reverse }: RangeOptions<number>): number[] {
    const compare = this.#compare;
    const values = this.values.filter(
      (item) =>
        (typeof gt === "undefined" || compare(item, gt) > 0) &&
        (typeof gte === "undefined" || compare(item, gte) >= 0) &&
        (typeof lt === "undefined" || compare(item, lt) < 0) &&
        (typeof lte === "undefined" || compare(item, lte) <= 0),
    );
    return reverse === true ? values.reverse() : values;
  }

  public checkQueries(tree: SortedTree<number>, item: number): void {
    const { values } = this;
    const compare = this.#compare;

    equal(tree.has(item), this.has(item));
    equal(tree.get(item), this.has(item) ? item : undefined);
    equal(tree.min(), values.at(0));
    equal(tree.max(), values.at(-1));
    equal(
      tree.floor(item),
      values.findLast((other) => compare(other, item) <= 0),
    );
    equal(
      tree.lower(item),
      values.findLast((other) => compare(other, item) < 0),
    );
    equal(
      tree.ceil(item),
      values.find((other) => compare(other, item) >= 0),
    );
    equal(
      tree.higher(item),
      values.find((other) => compare(other, item) > 0),
    );
  }
}

function apply(tree: SortedTree<number>, model: Model, op: Operation): void {
  switch (op.type) {
    case "insert":
      equal(tree.insert(op.value), model.insert(op.value));
      break;
    case "getOrInsert":
      model.insert(op.value);
      equal(tree.getOrInsert(op.value), op.value);
      break;
    case "delete":
      equal(tree.delete(op.value), model.delete(op.value));
      break;
    case "query":
      model.checkQueries(tree, op.value);
      break;
    case "range":
      deepEqual([...tree.range(op.options)], model.range(op.options));
      break;
    case "popMin": {
      const expected = model.values.at(0);
      model.values = model.values.slice(1);
      equal(tree.popMin(), expected);
      break;
    }
    case "popMax": {
      const expected = model.values.at(-1);
      model.values = model.values.slice(0, -1);
      equal(tree.popMax(), expected);
      break;
    }
    case "clear":
      model.values = [];
      tree.clear();
      break;
    default:
      throw new Error("Unknown operation");
  }
}

/** Checks the next value of a cursor against the model. */
function next(cursor: ICursor, model: Model): void {
  const { options, iterator, last } = cursor;
  const reverse = options.reverse === true;
  const expected = model
    .range(options)
    .find((item) => last === null || model.after(item, last, reverse));
  const result = iterator.next();

  if (cursor.done || typeof expected === "undefined") {
    deepEqual(result, { done: true, value: undefined });
    cursor.done = true;
  } else {
    deepEqual(result, { done: false, value: expected });
    cursor.last = expected;
  }
}

for (const [name, create] of kinds) {
  for (const [order, compare] of orders) {
    describe(`${name} (property-based, ${order})`, () => {
      it("behaves like a sorted set", () => {
        let longest = 0;

        fc.assert(
          fc.property(operations, (sequence) => {
            const tree = create(compare);
            const model = new Model(compare);

            longest = Math.max(longest, sequence.length);

            for (const item of sequence) {
              apply(tree, model, item);
              assertInvariants(tree);
              equal(tree.size, model.values.length);
              deepEqual(tree.toArray(), model.values);
            }
          }),
          { numRuns: 200 },
        );

        ok(
          longest >= longEnough.operations,
          `the longest sequence has only ${String(longest)} operations`,
        );
      });

      it("keeps live iterators consistent while the tree is modified", () => {
        let longestInitial = 0;
        let longestSteps = 0;

        fc.assert(
          fc.property(
            initialValues,
            iteratorOptions,
            steps,
            (initial, optionsList, sequence) => {
              longestInitial = Math.max(longestInitial, initial.length);
              longestSteps = Math.max(longestSteps, sequence.length);

              const tree = create(compare, initial);
              const model = new Model(compare, initial);
              const cursors: ICursor[] = optionsList.map((options) => ({
                done: false,
                iterator: tree.range(options),
                last: null,
                options,
              }));

              for (const current of sequence) {
                switch (current.type) {
                  case "insert":
                    tree.insert(current.value);
                    model.insert(current.value);
                    break;
                  case "delete":
                    tree.delete(current.value);
                    model.delete(current.value);
                    break;
                  case "clear":
                    tree.clear();
                    model.values = [];
                    break;
                  case "next": {
                    const cursor = cursors.at(
                      current.iterator % cursors.length,
                    );

                    if (!cursor) {
                      throw new Error("No cursor");
                    }

                    next(cursor, model);
                    break;
                  }
                  default:
                    throw new Error("Unknown step");
                }
              }
            },
          ),
          { numRuns: 200 },
        );

        ok(
          longestInitial >= longEnough.initial,
          `the longest initial array has only ${String(longestInitial)} values`,
        );
        ok(
          longestSteps >= longEnough.steps,
          `the longest sequence has only ${String(longestSteps)} steps`,
        );
      });
    });
  }
}
