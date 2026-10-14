/* eslint-disable @typescript-eslint/no-floating-promises */
import { doesNotThrow, ok, throws } from "node:assert/strict";
import { describe, it } from "node:test";

import { AVLTree, BSTree, type SortedTree } from "../src/index.js";
import type { TreeNode } from "../src/internal/node.js";
import { getCore } from "../src/sorted-tree.js";
import { assertInvariants } from "./helpers/invariants.js";

interface INodes {
  root: TreeNode<number>;
  left: TreeNode<number>;
  right: TreeNode<number>;
}

/** Builds `((1)2(3))` and lets `change` corrupt it. */
function corrupted(
  tree: SortedTree<number>,
  change: (nodes: INodes) => void,
): SortedTree<number> {
  const { root } = getCore(tree);

  ok(root?.left && root.right, "the tree must have two levels");
  change({ root, left: root.left, right: root.right });

  return tree;
}

describe("assertInvariants", () => {
  it("accepts valid trees", () => {
    doesNotThrow(() => {
      assertInvariants(AVLTree.from([2, 1, 3]));
    });
    doesNotThrow(() => {
      assertInvariants(BSTree.from([1, 2, 3]));
    });
  });

  for (const [name, change, message] of [
    [
      "a left child without a parent",
      ({ left }): void => {
        left.parent = null;
      },
      "broken parent link",
    ],
    [
      "a right child without a parent",
      ({ right }): void => {
        right.parent = null;
      },
      "broken parent link",
    ],
    [
      "a child linked to another parent",
      ({ left, right }): void => {
        left.parent = right;
      },
      "broken parent link",
    ],
    [
      "a root with a parent",
      ({ root, left }): void => {
        root.parent = left;
      },
      "the root has a parent",
    ],
    [
      "a wrong stored height",
      ({ root }): void => {
        root.height = 3;
      },
      "wrong height",
    ],
    [
      "a cycle through a left link",
      ({ root }): void => {
        root.left = root;
      },
      "the tree has a cycle",
    ],
    [
      // Children are checked before the traversal goes right, so the broken
      // parent link stops it before it could loop
      "a cycle through a right link",
      ({ root, right }): void => {
        right.right = root;
      },
      "broken parent link",
    ],
    [
      "values out of order",
      ({ left, right }): void => {
        [left.value, right.value] = [right.value, left.value];
      },
      "wrong order",
    ],
  ] as [string, (nodes: INodes) => void, string][]) {
    it(`rejects ${name}`, () => {
      const tree = corrupted(AVLTree.from([2, 1, 3]), change);

      throws(
        () => {
          assertInvariants(tree);
        },
        { name: "AssertionError", message: new RegExp(`^${message}`, "u") },
      );
    });
  }

  it("rejects a wrong size", () => {
    const tree = AVLTree.from([2, 1, 3]);

    getCore(tree).size = 4;
    throws(
      () => {
        assertInvariants(tree);
      },
      {
        name: "AssertionError",
        message: /^`size` does not match the node count/u,
      },
    );
  });

  it("rejects an unbalanced AVL tree", () => {
    const tree = corrupted(AVLTree.from([2, 1, 3, 4]), ({ root }) => {
      root.left = null;
    });

    getCore(tree).size = 3;
    throws(
      () => {
        assertInvariants(tree);
      },
      { name: "AssertionError", message: /^the tree is not balanced/u },
    );
  });
});
