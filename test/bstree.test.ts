/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable init-declarations */
import { deepEqual, throws } from "node:assert/strict";
import { describe, it } from "node:test";

import { BSTree } from "../index.js";
import { Node } from "../src/node.js";

function assertTree<T = unknown>(
  actual: BSTree<T>,
  expected: {
    height: number;
    max: Node<T> | null;
    min: Node<T> | null;
    size: number;
    width: number;
  },
): void {
  deepEqual(actual.height, expected.height);
  deepEqual(actual.max, expected.max);
  deepEqual(actual.max?.data, expected.max?.data);
  deepEqual(actual.min, expected.min);
  deepEqual(actual.min?.data, expected.min?.data);
  deepEqual(actual.size, expected.size);
  deepEqual(actual.width, expected.width);
}

function assertNode<T = unknown>(
  actual: Node<T>,
  expected: {
    data: T;
    grandparent: Node<T> | null;
    height: number;
    left: Node<T> | null;
    right: Node<T> | null;
    max: Node<T> | null;
    min: Node<T> | null;
    parent: Node<T> | null;
    sibling: Node<T> | null;
    size: number;
    uncle: Node<T> | null;
    width: number;
  },
): void {
  deepEqual(actual.data, expected.data);
  deepEqual(actual.grandparent, expected.grandparent);
  deepEqual(actual.grandparent?.data, expected.grandparent?.data);
  deepEqual(actual.height, expected.height);
  deepEqual(actual.left, expected.left);
  deepEqual(actual.left?.data, expected.left?.data);
  deepEqual(actual.right, expected.right);
  deepEqual(actual.right?.data, expected.right?.data);
  deepEqual(actual.max, expected.max);
  deepEqual(actual.max.data, expected.max?.data);
  deepEqual(actual.min, expected.min);
  deepEqual(actual.min.data, expected.min?.data);
  deepEqual(actual.parent, expected.parent);
  deepEqual(actual.parent?.data, expected.parent?.data);
  deepEqual(actual.sibling, expected.sibling);
  deepEqual(actual.sibling?.data, expected.sibling?.data);
  deepEqual(actual.size, expected.size);
  deepEqual(actual.uncle, expected.uncle);
  deepEqual(actual.uncle?.data, expected.uncle?.data);
  deepEqual(actual.width, expected.width);
}

function assertIterator<T = unknown>(
  actual: BSTree<T>,
  ...expected: Node<T>[]
): void {
  let i = 0;

  for (const node of actual) {
    assertNode(node, expected[i]);
    i += 1;
  }

  deepEqual(i, expected.length);
  deepEqual(
    actual.array,
    expected.map(({ data }) => data),
  );
}

describe("BSTree", () => {
  const tree = new BSTree<number>();
  let node0: Node<number>;
  let node1: Node<number>;
  let node2: Node<number>;
  let node3: Node<number>;
  let node4: Node<number>;
  let node5: Node<number>;
  let node6: Node<number>;

  it(".insert()", () => {
    assertTree<number>(tree, {
      height: -1,
      max: null,
      min: null,
      size: 0,
      width: 0,
    });
    deepEqual(tree.find(3), null);

    // Insert 3
    node3 = tree.insert(3);
    deepEqual(node3, tree.insert(3));
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 0,
      max: node3,
      min: node3,
      size: 1,
      width: 1,
    });
    assertIterator<number>(tree, node3);
    deepEqual(tree.find(3), node3);

    // Insert 5
    node5 = tree.insert(5);
    deepEqual(node5, tree.insert(5));
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 1,
      left: null,
      right: node5,
      max: node5,
      min: node3,
      parent: null,
      sibling: null,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node5,
      min: node5,
      parent: node3,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 1,
      max: node5,
      min: node3,
      size: 2,
      width: 1,
    });
    assertIterator<number>(tree, node3, node5);
    deepEqual(tree.find(5), node5);

    // Insert 4
    node4 = tree.insert(4);
    assertNode<number>(node4, {
      data: 4,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: node5,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 2,
      left: null,
      right: node5,
      max: node5,
      min: node3,
      parent: null,
      sibling: null,
      size: 3,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: node4,
      right: null,
      max: node5,
      min: node4,
      parent: node3,
      sibling: null,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node5,
      min: node3,
      size: 3,
      width: 1,
    });
    assertIterator<number>(tree, node3, node4, node5);
    deepEqual(tree.find(4), node4);

    // Insert 6
    node6 = tree.insert(6);
    assertNode<number>(node6, {
      data: 6,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: node4,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: node5,
      sibling: node6,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 2,
      left: null,
      right: node5,
      max: node6,
      min: node3,
      parent: null,
      sibling: null,
      size: 4,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: node4,
      right: node6,
      max: node6,
      min: node4,
      parent: node3,
      sibling: null,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node3,
      size: 4,
      width: 2,
    });
    assertIterator<number>(tree, node3, node4, node5, node6);
    deepEqual(tree.find(6), node6);

    // Insert 1
    node1 = tree.insert(1);
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: node3,
      sibling: node5,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: node4,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: node5,
      sibling: node6,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 2,
      left: node1,
      right: node5,
      max: node6,
      min: node1,
      parent: null,
      sibling: null,
      size: 5,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: node4,
      right: node6,
      max: node6,
      min: node4,
      parent: node3,
      sibling: node1,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node1,
      size: 5,
      width: 2,
    });
    assertIterator<number>(tree, node1, node3, node4, node5, node6);
    deepEqual(tree.find(1), node1);

    // Insert 0
    node0 = tree.insert(0);
    assertNode<number>(node0, {
      data: 0,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node1,
      sibling: null,
      size: 1,
      uncle: node5,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 1,
      left: node0,
      right: null,
      max: node1,
      min: node0,
      parent: node3,
      sibling: node5,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: node4,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: node5,
      sibling: node6,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 2,
      left: node1,
      right: node5,
      max: node6,
      min: node0,
      parent: null,
      sibling: null,
      size: 6,
      uncle: null,
      width: 3,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: node4,
      right: node6,
      max: node6,
      min: node4,
      parent: node3,
      sibling: node1,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 6,
      width: 3,
    });
    assertIterator<number>(tree, node0, node1, node3, node4, node5, node6);
    deepEqual(tree.find(0), node0);

    // Insert 2
    node2 = tree.insert(2);
    assertNode<number>(node2, {
      data: 2,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: node1,
      sibling: node0,
      size: 1,
      uncle: node5,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node1,
      sibling: node2,
      size: 1,
      uncle: node5,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 1,
      left: node0,
      right: node2,
      max: node2,
      min: node0,
      parent: node3,
      sibling: node5,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: node4,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: node3,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: node5,
      sibling: node6,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 2,
      left: node1,
      right: node5,
      max: node6,
      min: node0,
      parent: null,
      sibling: null,
      size: 7,
      uncle: null,
      width: 4,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: node4,
      right: node6,
      max: node6,
      min: node4,
      parent: node3,
      sibling: node1,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 7,
      width: 4,
    });
    assertIterator<number>(
      tree,
      node0,
      node1,
      node2,
      node3,
      node4,
      node5,
      node6,
    );
    deepEqual(tree.find(2), node2);
  });

  it(".from() (default comparator)", () => {
    const input = [3, 1, 0, 2, 5, 4, 6];
    const other_tree = BSTree.from(input);
    deepEqual(
      other_tree.array,
      input.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    );

    assertTree<number>(other_tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 7,
      width: 4,
    });
  });

  it(".from()", () => {
    const input = [
      { id: 3 },
      { id: 1 },
      { id: 0 },
      { id: 2 },
      { id: 5 },
      { id: 4 },
      { id: 6 },
    ];
    function Comparator(a: { id: number }, b: { id: number }): number {
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }
    const other_tree = BSTree.from(input, Comparator);
    deepEqual(other_tree.array, input.sort(Comparator));
  });

  it(".delete()", () => {
    // remove 3
    deepEqual(tree.delete(3), { node: node4, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: node4,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: node1,
      sibling: node0,
      size: 1,
      uncle: node5,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: node4,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node1,
      sibling: node2,
      size: 1,
      uncle: node5,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 1,
      left: node0,
      right: node2,
      max: node2,
      min: node0,
      parent: node4,
      sibling: node5,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: node4,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: null,
      size: 1,
      uncle: node1,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 2,
      left: node1,
      right: node5,
      max: node6,
      min: node0,
      parent: null,
      sibling: null,
      size: 6,
      uncle: null,
      width: 3,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: null,
      right: node6,
      max: node6,
      min: node5,
      parent: node4,
      sibling: node1,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 6,
      width: 3,
    });
    deepEqual(tree.delete(3), { node: null });
    assertIterator<number>(tree, node0, node1, node2, node4, node5, node6);
    deepEqual(tree.find(3), null);

    // remove 1
    deepEqual(tree.delete(1), { node: node2, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 1,
      left: node0,
      right: null,
      max: node2,
      min: node0,
      parent: node4,
      sibling: node5,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: node4,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node2,
      sibling: null,
      size: 1,
      uncle: node5,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: node4,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: null,
      size: 1,
      uncle: node2,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 2,
      left: node2,
      right: node5,
      max: node6,
      min: node0,
      parent: null,
      sibling: null,
      size: 5,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: null,
      right: node6,
      max: node6,
      min: node5,
      parent: node4,
      sibling: node2,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 5,
      width: 2,
    });
    deepEqual(tree.delete(1), { node: null });
    assertIterator<number>(tree, node0, node2, node4, node5, node6);
    deepEqual(tree.find(1), null);

    // remove 2
    deepEqual(tree.delete(2), { node: node0, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node4,
      sibling: node5,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: node4,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node5,
      sibling: null,
      size: 1,
      uncle: node0,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 2,
      left: node0,
      right: node5,
      max: node6,
      min: node0,
      parent: null,
      sibling: null,
      size: 4,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: null,
      right: node6,
      max: node6,
      min: node5,
      parent: node4,
      sibling: node0,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 4,
      width: 2,
    });
    deepEqual(tree.delete(2), { node: null });
    assertIterator<number>(tree, node0, node4, node5, node6);
    deepEqual(tree.find(2), null);

    // remove 5
    deepEqual(tree.delete(5), { node: node6, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node4,
      sibling: node6,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: node4,
      sibling: node0,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 1,
      left: node0,
      right: node6,
      max: node6,
      min: node0,
      parent: null,
      sibling: null,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node5,
      min: node5,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 1,
      max: node6,
      min: node0,
      size: 3,
      width: 2,
    });
    deepEqual(tree.delete(5), { node: null });
    assertIterator<number>(tree, node0, node4, node6);
    deepEqual(tree.find(5), null);

    // remove 6
    deepEqual(tree.delete(6), { node: node4, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: node4,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 1,
      left: node0,
      right: null,
      max: node4,
      min: node0,
      parent: null,
      sibling: null,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node5,
      min: node5,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 1,
      max: node4,
      min: node0,
      size: 2,
      width: 1,
    });
    deepEqual(tree.delete(6), { node: null });
    assertIterator<number>(tree, node0, node4);
    deepEqual(tree.find(6), null);

    // remove 4
    deepEqual(tree.delete(4), { node: node0, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node5,
      min: node5,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 0,
      max: node0,
      min: node0,
      size: 1,
      width: 1,
    });
    deepEqual(tree.delete(4), { node: null });
    assertIterator<number>(tree, node0);
    deepEqual(tree.find(4), null);

    // insert 4
    node4 = tree.insert(4);
    deepEqual(tree.find(4), node4);

    // remove 0
    deepEqual(tree.delete(0), { node: node4, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node5,
      min: node5,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: 0,
      max: node4,
      min: node4,
      size: 1,
      width: 1,
    });
    deepEqual(tree.delete(0), { node: null });
    assertIterator<number>(tree, node4);
    deepEqual(tree.find(0), null);

    // remove 4
    deepEqual(tree.delete(4), { node: null, success: true });
    assertNode<number>(node2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node2,
      min: node2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node0, {
      data: 0,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node0,
      min: node0,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node1, {
      data: 1,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node1,
      min: node1,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node6, {
      data: 6,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node6,
      min: node6,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node4, {
      data: 4,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node4,
      min: node4,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node3, {
      data: 3,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node3,
      min: node3,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode<number>(node5, {
      data: 5,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node5,
      min: node5,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertTree<number>(tree, {
      height: -1,
      max: null,
      min: null,
      size: 0,
      width: 0,
    });
    deepEqual(tree.delete(4), { node: null });
    assertIterator<number>(tree);
    deepEqual(tree.find(4), null);

    // insert 4 and 3
    node4 = tree.insert(4);
    node3 = tree.insert(3);
    deepEqual(tree.find(4), node4);
    deepEqual(tree.find(3), node3);

    // remove 3
    deepEqual(tree.delete(3), { node: node4, success: true });
    deepEqual(tree.find(4), node4);
    deepEqual(tree.find(3), null);
    deepEqual(tree.delete(3), { node: null });
    assertIterator<number>(tree, node4);

    // insert 0 and 2
    node0 = tree.insert(0);
    node2 = tree.insert(2);
    deepEqual(tree.find(2), node2);
    deepEqual(tree.find(0), node0);

    // remove 0
    deepEqual(tree.delete(0), { node: node2, success: true });
    deepEqual(tree.find(4), node4);
    deepEqual(tree.find(2), node2);
    deepEqual(tree.find(0), null);
    deepEqual(tree.delete(0), { node: null });
    assertIterator<number>(tree, node2, node4);

    // insert 0
    node0 = tree.insert(0);
    deepEqual(tree.find(0), node0);

    // remove 2 and 4
    deepEqual(tree.delete(2), { node: node0, success: true });
    deepEqual(tree.delete(4), { node: node0, success: true });
    deepEqual(tree.find(4), null);
    deepEqual(tree.find(0), node0);
    deepEqual(tree.find(2), null);

    // insert 2, 1 and 3
    node2 = tree.insert(2);
    node1 = tree.insert(1);
    node3 = tree.insert(3);
    deepEqual(tree.find(0), node0);
    deepEqual(tree.find(1), node1);
    deepEqual(tree.find(2), node2);
    deepEqual(tree.find(3), node3);

    // remove 2, 1, 3 and 0
    deepEqual(tree.delete(2), { node: node3, success: true });
    deepEqual(tree.delete(3), { node: node1, success: true });
    deepEqual(tree.delete(1), { node: node0, success: true });
    deepEqual(tree.delete(0), { node: null, success: true });
  });

  it(".delete() (when `min.right !== null`)\n", () => {
    const input = [2, 0, 5, 1, 3, 6, 4];
    const new_tree = BSTree.from(input);
    /*
          2
        /   \
      0      5
       \    / \
        1  3  6
            \
             4
    */
    const node_0 = new_tree.find(0);
    const node_1 = new_tree.find(1);
    const node_2 = new_tree.find(2);
    const node_3 = new_tree.find(3);
    const node_4 = new_tree.find(4);
    const node_5 = new_tree.find(5);
    const node_6 = new_tree.find(6);

    deepEqual(node_0?.data, 0);
    deepEqual(node_1?.data, 1);
    deepEqual(node_2?.data, 2);
    deepEqual(node_3?.data, 3);
    deepEqual(node_4?.data, 4);
    deepEqual(node_5?.data, 5);
    deepEqual(node_6?.data, 6);

    assertNode(node_0, {
      data: 0,
      grandparent: null,
      height: 1,
      left: null,
      right: node_1,
      max: node_1,
      min: node_0,
      parent: node_2,
      sibling: node_5,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertNode(node_1, {
      data: 1,
      grandparent: node_2,
      height: 0,
      left: null,
      right: null,
      max: node_1,
      min: node_1,
      parent: node_0,
      sibling: null,
      size: 1,
      uncle: node_5,
      width: 1,
    });
    assertNode(node_2, {
      data: 2,
      grandparent: null,
      height: 3,
      left: node_0,
      right: node_5,
      max: node_6,
      min: node_0,
      parent: null,
      sibling: null,
      size: 7,
      uncle: null,
      width: 3,
    });
    assertNode(node_3, {
      data: 3,
      grandparent: node_2,
      height: 1,
      left: null,
      right: node_4,
      max: node_4,
      min: node_3,
      parent: node_5,
      sibling: node_6,
      size: 2,
      uncle: node0,
      width: 1,
    });
    assertNode(node_4, {
      data: 4,
      grandparent: node_5,
      height: 0,
      left: null,
      right: null,
      max: node_4,
      min: node_4,
      parent: node_3,
      sibling: null,
      size: 1,
      uncle: node_6,
      width: 1,
    });
    assertNode(node_5, {
      data: 5,
      grandparent: null,
      height: 2,
      left: node_3,
      right: node_6,
      max: node_6,
      min: node_3,
      parent: node_2,
      sibling: node_0,
      size: 4,
      uncle: null,
      width: 2,
    });
    assertNode(node_6, {
      data: 6,
      grandparent: node_2,
      height: 0,
      left: null,
      right: null,
      max: node_6,
      min: node_6,
      parent: node_5,
      sibling: node_3,
      size: 1,
      uncle: node_0,
      width: 1,
    });

    new_tree.delete(2);

    /*
          3
        /  \
      0     5
       \   / \
        1 4  6
    */

    assertNode(node_0, {
      data: 0,
      grandparent: null,
      height: 1,
      left: null,
      right: node_1,
      max: node_1,
      min: node_0,
      parent: node_3,
      sibling: node_5,
      size: 2,
      uncle: null,
      width: 1,
    });
    assertNode(node_1, {
      data: 1,
      grandparent: node_3,
      height: 0,
      left: null,
      right: null,
      max: node_1,
      min: node_1,
      parent: node_0,
      sibling: null,
      size: 1,
      uncle: node_5,
      width: 1,
    });
    assertNode(node_2, {
      data: 2,
      grandparent: null,
      height: 0,
      left: null,
      right: null,
      max: node_2,
      min: node_2,
      parent: null,
      sibling: null,
      size: 1,
      uncle: null,
      width: 1,
    });
    assertNode(node_3, {
      data: 3,
      grandparent: null,
      height: 2,
      left: node_0,
      right: node_5,
      max: node_6,
      min: node_0,
      parent: null,
      sibling: null,
      size: 6,
      uncle: null,
      width: 3,
    });
    assertNode(node_4, {
      data: 4,
      grandparent: node_3,
      height: 0,
      left: null,
      right: null,
      max: node_4,
      min: node_4,
      parent: node_5,
      sibling: node_6,
      size: 1,
      uncle: node_0,
      width: 1,
    });
    assertNode(node_5, {
      data: 5,
      grandparent: null,
      height: 1,
      left: node_4,
      right: node_6,
      max: node_6,
      min: node_4,
      parent: node_3,
      sibling: node_0,
      size: 3,
      uncle: null,
      width: 2,
    });
    assertNode(node_6, {
      data: 6,
      grandparent: node_3,
      height: 0,
      left: null,
      right: null,
      max: node_6,
      min: node_6,
      parent: node_5,
      sibling: node_4,
      size: 1,
      uncle: node_0,
      width: 1,
    });
  });

  it("empty iterator", () => {
    const iterator = tree[Symbol.iterator]();
    deepEqual(typeof iterator.next().value, "undefined");
    deepEqual(typeof iterator.next().value, "undefined");
  });

  it("throw an error when set value is not an instance of the `Node`", () => {
    const newTree = new BSTree<number>();
    const node = newTree.insert(2);
    const error = new TypeError(
      "`node` is not an instance of the class `Node`",
    );
    throws(() => {
      node.left = {} as unknown as Node<number>;
    }, error);
    throws(() => {
      node.right = {} as unknown as Node<number>;
    }, error);
  });

  describe("Static methods", () => {
    it(".from()", () => {
      const input = [
        { id: 3 },
        { id: 1 },
        { id: 0 },
        { id: 2 },
        { id: 5 },
        { id: 4 },
        { id: 6 },
      ];
      function Comparator(a: { id: number }, b: { id: number }): number {
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      }
      const other_tree = BSTree.from(input, Comparator);
      deepEqual(other_tree.array, input.sort(Comparator));
    });

    it(".getDir()", () => {
      const node_0 = new Node(0);
      const node_1 = new Node(1);
      const node_2 = new Node(2);
      const node_3 = new Node(3);
      node_1.right = node_2;
      node_1.left = node_0;

      deepEqual(BSTree.getDir(-1), "right");
      deepEqual(BSTree.getDir(1), "left");
      deepEqual(BSTree.getDir(node_1, node_0), "left");
      deepEqual(BSTree.getDir(node_1, node_2), "right");
      throws(
        () => BSTree.getDir(0n as unknown as number),
        new TypeError("Compare result is not a number"),
      );
      throws(
        () => BSTree.getDir(1 as unknown as Node, node_3),
        new TypeError("Parent must be a valid Node"),
      );
      throws(
        () => BSTree.getDir(0),
        new TypeError("Compare result must be a nonzero number"),
      );
      throws(
        () => BSTree.getDir(node_1, node_3),
        new TypeError("Invalid `parent-child` pair"),
      );
    });
  });
});
