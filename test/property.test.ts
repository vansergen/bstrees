/* eslint-disable @typescript-eslint/no-floating-promises */
import { deepEqual, equal, ok } from "node:assert/strict";
import { describe, it } from "node:test";

import fc from "fast-check";

import {
  AVLTree,
  BSTree,
  type RangeOptions,
  type SortedTree,
} from "../src/index.js";
import { assertInvariants } from "./helpers/invariants.js";

type Operation =
  | { type: "clear" | "popMax" | "popMin" }
  | { type: "delete" | "getOrInsert" | "insert" | "query"; value: number }
  | { type: "range"; options: RangeOptions<number> };

type Step = { type: "delete" | "insert"; value: number } | { type: "next" };

const kinds: [string, (values?: Iterable<number>) => SortedTree<number>][] = [
  ["BSTree", (values = []): SortedTree<number> => BSTree.from(values)],
  ["AVLTree", (values = []): SortedTree<number> => AVLTree.from(values)],
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
  { arbitrary: fc.record({ type: fc.constant("next") }), weight: 3 },
  { arbitrary: fc.record({ type: fc.constant("insert"), value }), weight: 1 },
  { arbitrary: fc.record({ type: fc.constant("delete"), value }), weight: 1 },
);

// By default fast-check caps arrays at about 10 items whatever `maxLength` is,
// so `size: "max"` and `minLength` are needed for long sequences.
const operations = fc.array(operation, {
  maxLength: 200,
  minLength: 50,
  size: "max",
});
const initialValues = fc.array(value, { maxLength: 40, size: "max" });
const steps = fc.array(step, { maxLength: 80, minLength: 20, size: "max" });

/** The longest sequences the tests must reach to exercise deep trees. */
const longEnough = { initial: 30, operations: 150, steps: 60 };

function inRange(
  item: number,
  { gt, gte, lt, lte }: RangeOptions<number>,
): boolean {
  return (
    (typeof gt === "undefined" || item > gt) &&
    (typeof gte === "undefined" || item >= gte) &&
    (typeof lt === "undefined" || item < lt) &&
    (typeof lte === "undefined" || item <= lte)
  );
}

/** A sorted array of unique numbers that mirrors a tree. */
class Model {
  public values: number[] = [];

  public has(item: number): boolean {
    return this.values.includes(item);
  }

  public insert(item: number): boolean {
    if (this.has(item)) {
      return false;
    }

    this.values = [...this.values, item].sort((a, b) => a - b);
    return true;
  }

  public delete(item: number): boolean {
    const { length } = this.values;
    this.values = this.values.filter((other) => other !== item);
    return this.values.length !== length;
  }

  public range(options: RangeOptions<number>): number[] {
    const values = this.values.filter((item) => inRange(item, options));
    return options.reverse === true ? values.reverse() : values;
  }
}

function checkQueries(
  tree: SortedTree<number>,
  model: Model,
  item: number,
): void {
  const { values } = model;

  equal(tree.has(item), model.has(item));
  equal(tree.get(item), model.has(item) ? item : undefined);
  equal(tree.min(), values.at(0));
  equal(tree.max(), values.at(-1));
  equal(
    tree.floor(item),
    values.findLast((other) => other <= item),
  );
  equal(
    tree.lower(item),
    values.findLast((other) => other < item),
  );
  equal(
    tree.ceil(item),
    values.find((other) => other >= item),
  );
  equal(
    tree.higher(item),
    values.find((other) => other > item),
  );
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
      checkQueries(tree, model, op.value);
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
      throw new Error("Unknown op");
  }
}

for (const [name, create] of kinds) {
  describe(`${name} (property-based)`, () => {
    it("behaves like a sorted set", () => {
      let longest = 0;

      fc.assert(
        fc.property(operations, (sequence) => {
          const tree = create();
          const model = new Model();

          longest = Math.max(longest, sequence.length);

          for (const item of sequence) {
            apply(tree, model, item);
            assertInvariants(tree);
            equal(tree.size, model.values.length);
            deepEqual(tree.toArray(), model.values);
          }
        }),
        { numRuns: 300 },
      );

      ok(
        longest >= longEnough.operations,
        `the longest sequence has only ${String(longest)} operations`,
      );
    });

    it("iterates like a `Set` while the tree is modified", () => {
      let longestInitial = 0;
      let longestSteps = 0;

      fc.assert(
        fc.property(
          initialValues,
          rangeOptions,
          steps,
          (initial, options, sequence) => {
            longestInitial = Math.max(longestInitial, initial.length);
            longestSteps = Math.max(longestSteps, sequence.length);

            const tree = create(initial);
            const model = new Model();
            const iterator = tree.range(options);
            const direction = options.reverse === true ? -1 : 1;
            let last: number | null = null;
            let done = false;

            for (const item of initial) {
              model.insert(item);
            }

            for (const current of sequence) {
              if (current.type === "insert") {
                tree.insert(current.value);
                model.insert(current.value);
              } else if (current.type === "delete") {
                tree.delete(current.value);
                model.delete(current.value);
              } else {
                const from: number | null = last;
                const expected: number | undefined = model
                  .range(options)
                  .find(
                    (item) => from === null || (item - from) * direction > 0,
                  );
                const result = iterator.next();

                if (done || typeof expected === "undefined") {
                  deepEqual(result, { done: true, value: undefined });
                  done = true;
                } else {
                  deepEqual(result, { done: false, value: expected });
                  last = expected;
                }
              }
            }
          },
        ),
        { numRuns: 300 },
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
