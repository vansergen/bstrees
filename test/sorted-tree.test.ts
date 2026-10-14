/* eslint-disable @typescript-eslint/no-floating-promises */
import { deepEqual, equal, strictEqual, throws } from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AVLTree,
  BSTree,
  type Comparator,
  type SortedTree,
} from "../src/index.js";
import { assertInvariants } from "./helpers/invariants.js";

interface IRecord {
  id: number;
  name: string;
}

const byId: Comparator<IRecord> = (a, b) => a.id - b.id;

const kinds = [
  {
    name: "BSTree",
    numbers: (values: Iterable<number> = []): SortedTree<number> =>
      BSTree.from(values),
    create: <T>(compare: Comparator<T>): SortedTree<T> => new BSTree(compare),
  },
  {
    name: "AVLTree",
    numbers: (values: Iterable<number> = []): SortedTree<number> =>
      AVLTree.from(values),
    create: <T>(compare: Comparator<T>): SortedTree<T> => new AVLTree(compare),
  },
];

for (const { name, numbers, create } of kinds) {
  describe(name, () => {
    it("is empty when created", () => {
      const tree = numbers();

      equal(tree.size, 0);
      equal(tree.height, -1);
      equal(tree.min(), undefined);
      equal(tree.max(), undefined);
      equal(tree.popMin(), undefined);
      equal(tree.popMax(), undefined);
      equal(tree.has(1), false);
      equal(tree.get(1), undefined);
      equal(tree.delete(1), false);
      equal(tree.floor(1), undefined);
      deepEqual(tree.toArray(), []);
      deepEqual([...tree.valuesReversed()], []);
      assertInvariants(tree);
    });

    it("inserts unique values in order", () => {
      const tree = numbers();

      equal(tree.insert(3), true);
      equal(tree.height, 0);
      equal(tree.insert(1), true);
      equal(tree.insert(2), true);
      equal(tree.insert(2), false);
      equal(tree.size, 3);
      deepEqual(tree.toArray(), [1, 2, 3]);
      deepEqual([...tree], [1, 2, 3]);
      deepEqual([...tree.valuesReversed()], [3, 2, 1]);
      assertInvariants(tree);
    });

    it("finds values", () => {
      const tree = numbers([5, 3, 8]);

      equal(tree.has(3), true);
      equal(tree.has(4), false);
      equal(tree.get(8), 8);
      equal(tree.get(9), undefined);
      equal(tree.min(), 3);
      equal(tree.max(), 8);
    });

    it("keeps the stored instance of equal values", () => {
      const tree = create(byId);
      const alice = { id: 1, name: "Alice" };

      equal(tree.insert(alice), true);
      equal(tree.insert({ id: 1, name: "Bob" }), false);
      strictEqual(tree.get({ id: 1, name: "" }), alice);
      strictEqual(tree.getOrInsert({ id: 1, name: "Carol" }), alice);

      const bob = { id: 2, name: "Bob" };
      strictEqual(tree.getOrInsert(bob), bob);
      equal(tree.size, 2);
      assertInvariants(tree);
    });

    it("deletes values", () => {
      const tree = numbers([4, 2, 6, 1, 3, 5, 7]);

      equal(tree.delete(4), true);
      equal(tree.delete(4), false);
      equal(tree.delete(1), true);
      equal(tree.delete(6), true);
      deepEqual(tree.toArray(), [2, 3, 5, 7]);
      assertInvariants(tree);

      for (const value of [2, 3, 5, 7]) {
        equal(tree.delete(value), true);
        assertInvariants(tree);
      }

      equal(tree.size, 0);
      equal(tree.height, -1);
    });

    it("pops the smallest and the largest values", () => {
      const tree = numbers([3, 1, 4, 5, 9, 2, 6]);

      equal(tree.popMin(), 1);
      equal(tree.popMax(), 9);
      equal(tree.popMin(), 2);
      deepEqual(tree.toArray(), [3, 4, 5, 6]);
      assertInvariants(tree);
    });

    it("clears the tree", () => {
      const tree = numbers([1, 2, 3]);

      tree.clear();
      equal(tree.size, 0);
      deepEqual(tree.toArray(), []);
      equal(tree.insert(2), true);
      deepEqual(tree.toArray(), [2]);
    });

    it("answers floor/ceil/lower/higher queries", () => {
      const tree = numbers([10, 20, 30]);

      equal(tree.floor(20), 20);
      equal(tree.floor(25), 20);
      equal(tree.floor(5), undefined);
      equal(tree.ceil(20), 20);
      equal(tree.ceil(25), 30);
      equal(tree.ceil(35), undefined);
      equal(tree.lower(20), 10);
      equal(tree.lower(10), undefined);
      equal(tree.higher(20), 30);
      equal(tree.higher(30), undefined);
    });

    it("iterates over ranges", () => {
      const tree = numbers([1, 2, 3, 4, 5]);

      deepEqual([...tree.range()], [1, 2, 3, 4, 5]);
      deepEqual([...tree.range({ gte: 2, lt: 4 })], [2, 3]);
      deepEqual([...tree.range({ gt: 2, lte: 4 })], [3, 4]);
      deepEqual([...tree.range({ gt: 1.5, lt: 4.5 })], [2, 3, 4]);
      deepEqual([...tree.range({ gt: 3, reverse: true })], [5, 4]);
      deepEqual([...tree.range({ lte: 3, reverse: true })], [3, 2, 1]);
      deepEqual([...tree.range({ gte: 2, lte: 4, reverse: true })], [4, 3, 2]);
      deepEqual([...tree.range({ gte: 4, lte: 2 })], []);
      deepEqual([...tree.range({ gt: 5 })], []);
      deepEqual(
        [...tree.range({ gt: undefined, lte: 2, reverse: undefined })],
        [1, 2],
      );
    });

    it("rejects conflicting range bounds", () => {
      const tree = numbers([1]);

      throws(() => tree.range({ gt: 1, gte: 1 }), {
        name: "TypeError",
        message: "`gt` and `gte` cannot be used together",
      });
      throws(() => tree.range({ lt: 1, lte: 1 }), {
        name: "TypeError",
        message: "`lt` and `lte` cannot be used together",
      });
    });

    it("returns iterable iterators with helpers", () => {
      const tree = numbers([1, 2, 3, 4, 5]);
      const iterator = tree.values();

      strictEqual(iterator[Symbol.iterator](), iterator);
      deepEqual(
        tree
          .values()
          .filter((value) => value % 2 === 1)
          .map((value) => value * 10)
          .toArray(),
        [10, 30, 50],
      );
      deepEqual(iterator.next(), { done: false, value: 1 });
      deepEqual([...iterator], [2, 3, 4, 5]);
      deepEqual(iterator.next(), { done: true, value: undefined });
    });

    it("tolerates modifications during iteration", () => {
      const tree = numbers([1, 2, 3, 4, 5]);
      const seen: number[] = [];

      for (const value of tree) {
        seen.push(value);

        if (value === 2) {
          tree.delete(2);
          tree.delete(4);
          tree.insert(0);
          tree.insert(6);
        }
      }

      deepEqual(seen, [1, 2, 3, 5, 6]);

      const reversed: number[] = [];

      for (const value of tree.valuesReversed()) {
        reversed.push(value);

        if (value === 5) {
          tree.delete(3);
        }
      }

      deepEqual(reversed, [6, 5, 1, 0]);
    });

    it("continues after the last returned value is removed", () => {
      const records = [1, 2, 3].map((id) => ({ id, name: String(id) }));
      const tree = create(byId);

      for (const record of records) {
        tree.insert(record);
      }

      const forward = tree.values();
      const first = forward.next().value;

      if (first) {
        tree.delete(first);
      }

      deepEqual(
        [...forward].map(({ id }) => id),
        [2, 3],
      );

      const backward = tree.valuesReversed();
      const last = backward.next().value;

      if (last) {
        tree.delete(last);
      }

      deepEqual(
        [...backward].map(({ id }) => id),
        [2],
      );
    });

    it("positions iterators lazily", () => {
      const tree = numbers([2]);
      const iterator = tree.values();

      tree.insert(1);
      deepEqual([...iterator], [1, 2]);
    });

    it("calls `forEach` callbacks with the value, index and tree", () => {
      const tree = numbers([3, 1, 2]);
      const context = { calls: [] as [number, number][] };

      tree.forEach(function callback(this: typeof context, value, index, self) {
        strictEqual(self, tree);
        this.calls.push([value, index]);
      }, context);

      deepEqual(context.calls, [
        [1, 0],
        [2, 1],
        [3, 2],
      ]);
    });

    it("validates the comparator result", () => {
      for (const [result, type] of [
        [Number.NaN, "NaN"],
        [null, "null"],
        [undefined, "undefined"],
        ["0", "string"],
        [0n, "bigint"],
        [1n, "bigint"],
        [false, "boolean"],
        [{}, "object"],
      ] as const) {
        const tree = create<number>(() => result as unknown as number);

        throws(() => tree.insert(1), {
          name: "TypeError",
          message: `The comparator must return a number other than NaN, got ${type}`,
        });
        equal(tree.size, 0);
      }
    });

    it("rejects results that are only numeric after a conversion", () => {
      const tree = create<number>(
        (a, b) => (a === b ? 0 : String(a - b)) as unknown as number,
      );

      equal(tree.insert(1), true);
      throws(() => tree.insert(2), {
        name: "TypeError",
        message:
          "The comparator must return a number other than NaN, got string",
      });
      deepEqual(tree.toArray(), [1]);
    });

    it("rejects comparators that are not functions", () => {
      for (const [compare, type] of [
        ["desc", "string"],
        [null, "null"],
        [1, "number"],
        [{}, "object"],
      ] as const) {
        throws(() => create(compare as unknown as Comparator<number>), {
          name: "TypeError",
          message: `The comparator must be a function, got ${type}`,
        });
      }
    });

    it("calls the comparator without a receiver", () => {
      const receivers = new Set<unknown>();
      const tree = create<number>(function compare(this: unknown, a, b) {
        receivers.add(this);
        return a - b;
      });

      tree.insert(2);
      tree.insert(1);
      tree.has(3);
      deepEqual([...tree.range({ gte: 1, lt: 3 })], [1, 2]);
      tree.delete(2);
      deepEqual([...receivers], [undefined]);
    });

    it("rejects comparators that are not reflexive", () => {
      const tree = create<number>(() => 1);
      const error = {
        name: "TypeError",
        message:
          "The comparator must return 0 when a value is compared with itself",
      };

      throws(() => tree.insert(1), error);
      throws(() => tree.has(1), error);
      throws(() => tree.floor(1), error);
      throws(() => tree.range({ lt: 1 }), error);
      equal(tree.size, 0);
    });

    it("leaves the tree unchanged when the comparator throws", () => {
      const error = new Error("comparator failed");
      let fail = false;
      const tree = create<number>((a, b) => {
        if (fail) {
          throw error;
        }
        return a - b;
      });

      for (const value of [4, 2, 6, 1, 3, 5, 7]) {
        tree.insert(value);
      }

      fail = true;
      throws(() => tree.insert(8), error);
      throws(() => tree.delete(4), error);
      throws(() => tree.getOrInsert(0), error);
      fail = false;
      deepEqual(tree.toArray(), [1, 2, 3, 4, 5, 6, 7]);
      assertInvariants(tree);
    });

    it("rejects modifications of the tree from its comparator", () => {
      const mutations: [string, (tree: SortedTree<number>) => unknown][] = [
        ["insert", (tree): unknown => tree.insert(10)],
        ["getOrInsert", (tree): unknown => tree.getOrInsert(10)],
        ["delete", (tree): unknown => tree.delete(1)],
        [
          "clear",
          (tree): void => {
            tree.clear();
          },
        ],
        ["popMin", (tree): unknown => tree.popMin()],
        ["popMax", (tree): unknown => tree.popMax()],
      ];
      const triggers: [string, (tree: SortedTree<number>) => unknown][] = [
        ["insert", (tree): unknown => tree.insert(4)],
        ["delete", (tree): unknown => tree.delete(2)],
        ["has", (tree): unknown => tree.has(2)],
        ["iteration", (tree): unknown => [...tree.range({ lt: 3 })]],
      ];

      for (const [mutation, mutate] of mutations) {
        for (const [trigger, run] of triggers) {
          const state: { armed: boolean; tree: SortedTree<number> | null } = {
            armed: false,
            tree: null,
          };
          const tree = create<number>((a, b) => {
            if (state.armed && state.tree) {
              state.armed = false;
              mutate(state.tree);
            }
            return a - b;
          });

          state.tree = tree;

          for (const value of [1, 2, 3]) {
            tree.insert(value);
          }

          state.armed = true;
          throws(
            () => run(tree),
            {
              name: "TypeError",
              message:
                "A tree cannot be modified while its comparator is running",
            },
            `${mutation} during ${trigger}`,
          );
          deepEqual(tree.toArray(), [1, 2, 3]);
          equal(tree.size, 3);
          assertInvariants(tree);
        }
      }
    });

    it("lets the comparator read the tree and modify other trees", () => {
      const other = numbers();
      const state: { reading: boolean; tree: SortedTree<number> | null } = {
        reading: false,
        tree: null,
      };
      const tree = create<number>((a, b) => {
        other.insert(a);

        if (!state.reading && state.tree) {
          state.reading = true;
          state.tree.has(b);
          state.tree.toArray();
          state.reading = false;
        }

        return a - b;
      });

      state.tree = tree;

      for (const value of [3, 1, 2]) {
        tree.insert(value);
      }

      deepEqual(tree.toArray(), [1, 2, 3]);
      deepEqual(other.toArray(), [1, 2, 3]);
      assertInvariants(tree);
    });

    it("handles 10 000 sequential insertions and removals", () => {
      const tree = numbers();
      const count = 10_000;

      for (let value = 0; value < count; value += 1) {
        tree.insert(value);
      }

      equal(tree.size, count);
      assertInvariants(tree);

      for (let value = 0; value < count; value += 2) {
        tree.delete(value);
      }

      equal(tree.size, count / 2);
      assertInvariants(tree);
    });
  });
}

describe("default comparator", () => {
  it("orders numbers, strings and bigints", () => {
    deepEqual(BSTree.from([3, -0, 0, -1, 2.5]).toArray(), [-1, -0, 2.5, 3]);
    deepEqual(AVLTree.from(["b", "a", "B"]).toArray(), ["B", "a", "b"]);
    deepEqual(BSTree.from([2n, 1n, 3n]).toArray(), [1n, 2n, 3n]);
  });

  it("rejects NaN and other values whether the tree is empty or not", () => {
    const error = {
      name: "TypeError",
      message: /^The default comparator supports only numbers/u,
    };

    for (const tree of [new BSTree<number>(), AVLTree.from([1, 2, 3])]) {
      const values = tree.toArray();

      for (const value of [Number.NaN, {} as unknown as number]) {
        throws(() => tree.has(value), error);
        throws(() => tree.get(value), error);
        throws(() => tree.insert(value), error);
        throws(() => tree.getOrInsert(value), error);
        throws(() => tree.delete(value), error);
        throws(() => tree.floor(value), error);
        throws(() => tree.ceil(value), error);
        throws(() => tree.lower(value), error);
        throws(() => tree.higher(value), error);

        for (const key of ["gt", "gte", "lt", "lte"]) {
          throws(() => tree.range({ [key]: value }), error);
        }
      }

      deepEqual(tree.toArray(), values);
    }
  });

  it("rejects NaN, mixed types and other values", () => {
    const error = {
      name: "TypeError",
      message:
        "The default comparator supports only numbers (except NaN), strings " +
        "and bigints of the same type. Pass a comparator to the tree constructor.",
    };
    const tree = BSTree.from([5, 3, 8]);

    throws(() => tree.insert(Number.NaN), error);
    throws(() => tree.delete(Number.NaN), error);
    throws(() => tree.has(Number.NaN), error);
    throws(() => new BSTree<number>().insert(Number.NaN), error);
    throws(() => tree.insert("4" as unknown as number), error);
    throws(() => tree.insert(4n as unknown as number), error);
    throws(() => BSTree.from(["a", 1 as unknown as string]), error);
    throws(() => AVLTree.from([{}] as unknown as number[]), error);
    deepEqual(tree.toArray(), [3, 5, 8]);
  });
});
