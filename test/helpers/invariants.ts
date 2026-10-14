import { ok, strictEqual } from "node:assert/strict";

import type { TreeNode } from "../../src/internal/node.js";
import { type SortedTree, getCore } from "../../src/sorted-tree.js";

/**
 * Checks the structure of a tree: parent links, strict ordering, size,
 * stored heights and, for balanced trees, the AVL property.
 */
export function assertInvariants<T>(tree: SortedTree<T>): void {
  const core = getCore(tree);
  const stack: TreeNode<T>[] = [];
  let node = core.root;
  let previous: TreeNode<T> | null = null;
  let count = 0;

  strictEqual(core.root?.parent ?? null, null, "the root has a parent");

  while (node || stack.length > 0) {
    while (node) {
      stack.push(node);
      node = node.left;
    }

    const current = stack.pop();

    if (!current) {
      break;
    }

    const { left, right } = current;
    const leftHeight = left?.height ?? 0;
    const rightHeight = right?.height ?? 0;

    for (const child of [left, right]) {
      if (child) {
        strictEqual(child.parent, current, "broken parent link");
      }
    }

    strictEqual(
      current.height,
      1 + Math.max(leftHeight, rightHeight),
      "wrong height",
    );

    if (core.balanced) {
      ok(Math.abs(leftHeight - rightHeight) <= 1, "the tree is not balanced");
    }

    if (previous) {
      ok(core.compare(previous.value, current.value) < 0, "wrong order");
    }

    previous = current;
    count += 1;
    node = right;
  }

  strictEqual(count, core.size, "`size` does not match the node count");
}

function shapeOf<T>(node: TreeNode<T> | null): string {
  return node
    ? `(${shapeOf(node.left)}${String(node.value)}${shapeOf(node.right)})`
    : "";
}

/** Renders a tree as nested parentheses, e.g. `((1)2(3))`. */
export function toShape<T>(tree: SortedTree<T>): string {
  return shapeOf(getCore(tree).root);
}
