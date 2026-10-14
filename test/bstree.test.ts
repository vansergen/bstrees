/* eslint-disable @typescript-eslint/no-floating-promises */
import { equal } from "node:assert/strict";
import { describe, it } from "node:test";

import { BSTree } from "../src/index.js";
import { assertInvariants, toShape } from "./helpers/invariants.js";

describe("BSTree", () => {
  it("does not rebalance", () => {
    const tree = BSTree.from([1, 2, 3]);

    equal(toShape(tree), "(1(2(3)))");
    equal(tree.height, 2);
    assertInvariants(tree);
  });

  for (const [name, values, value, shape] of [
    ["a leaf", [2, 1, 3], 3, "((1)2)"],
    ["a node with a left child", [3, 2, 1], 2, "((1)3)"],
    ["a node with a right child", [1, 2, 3], 2, "(1(3))"],
    ["the root with one child", [1, 2], 1, "(2)"],
    ["a node with two children", [5, 2, 8, 1, 3], 2, "(((1)3)5(8))"],
    [
      "a node whose successor is deep",
      [5, 2, 9, 7, 10, 6, 8],
      5,
      "((2)6((7(8))9(10)))",
    ],
  ] as const) {
    it(`removes ${name}`, () => {
      const tree = BSTree.from(values);

      equal(tree.delete(value), true);
      equal(toShape(tree), shape);
      assertInvariants(tree);
    });
  }
});
