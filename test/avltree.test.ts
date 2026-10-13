/* eslint-disable @typescript-eslint/no-floating-promises */
import { deepEqual, equal, ok } from "node:assert/strict";
import { describe, it } from "node:test";

import { AVLTree } from "../src/index.js";
import { assertInvariants, toShape } from "./helpers/invariants.js";

function permutations(values: number[]): number[][] {
  const result: number[][] = [];
  const stack: [number[], number[]][] = [[[], values]];

  while (stack.length > 0) {
    const item = stack.pop();

    if (item) {
      const [prefix, rest] = item;

      if (rest.length === 0) {
        result.push(prefix);
      }

      rest.forEach((value, index) => {
        stack.push([
          [...prefix, value],
          [...rest.slice(0, index), ...rest.slice(index + 1)],
        ]);
      });
    }
  }

  return result;
}

describe("AVLTree", () => {
  describe("rotations after insertion", () => {
    for (const [name, values] of [
      ["left", [1, 2, 3]],
      ["right", [3, 2, 1]],
      ["left-right", [3, 1, 2]],
      ["right-left", [1, 3, 2]],
    ] as const) {
      it(name, () => {
        const tree = AVLTree.from(values);

        equal(toShape(tree), "((1)2(3))");
        equal(tree.height, 1);
        assertInvariants(tree);
      });
    }
  });

  describe("rotations after removal", () => {
    for (const [name, values, value, shape] of [
      ["left", [2, 1, 4, 3, 5], 1, "((2(3))4(5))"],
      ["right", [4, 2, 5, 1, 3], 5, "((1)2((3)4))"],
      ["right-left", [3, 2, 5, 4], 2, "((3)4(5))"],
      ["left-right", [3, 1, 4, 2], 4, "((1)2(3))"],
    ] as const) {
      it(name, () => {
        const tree = AVLTree.from(values);

        equal(tree.delete(value), true);
        equal(toShape(tree), shape);
        assertInvariants(tree);
      });
    }
  });

  it("stays balanced for every insertion and removal order of 1..7", () => {
    const all = permutations([1, 2, 3, 4, 5, 6, 7]);

    equal(all.length, 5040);

    all.forEach((order, index) => {
      const tree = new AVLTree<number>();

      for (const value of order) {
        tree.insert(value);
        assertInvariants(tree);
      }

      for (const value of all[all.length - 1 - index] ?? []) {
        tree.delete(value);
        assertInvariants(tree);
      }

      equal(tree.size, 0);
    });
  });

  it("keeps a logarithmic height and number of comparisons", () => {
    const count = 2 ** 16;
    const bound = Math.log2(count) + 2;
    let calls = 0;
    const tree = new AVLTree<number>((a, b) => {
      calls += 1;
      return a - b;
    });

    for (let value = 0; value < count; value += 1) {
      tree.insert(value);
    }

    ok(calls <= count * bound, `${calls} comparisons for ${count} insertions`);
    ok(tree.height <= 1.44 * Math.log2(count + 2), `height ${tree.height}`);
    assertInvariants(tree);

    calls = 0;

    for (let value = 0; value < count; value += 1) {
      tree.delete(value);
    }

    ok(calls <= count * bound, `${calls} comparisons for ${count} removals`);
    deepEqual(tree.toArray(), []);
  });
});
