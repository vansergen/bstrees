import { deepStrictEqual, throws } from "node:assert";
import { BSTree } from "../index.js";
import type { Node } from "../src/node.js";

function assertTree<T = unknown>(
  actual: BSTree<T>,
  expected: {
    height: number;
    max: Node<T> | null;
    min: Node<T> | null;
    size: number;
    width: number;
  }
): void {
  deepStrictEqual(actual.height, expected.height);
  deepStrictEqual(actual.max, expected.max);
  deepStrictEqual(actual.max?.data, expected.max?.data);
  deepStrictEqual(actual.min, expected.min);
  deepStrictEqual(actual.min?.data, expected.min?.data);
  deepStrictEqual(actual.size, expected.size);
  deepStrictEqual(actual.width, expected.width);
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
  }
): void {
  deepStrictEqual(actual.data, expected.data);
  deepStrictEqual(actual.grandparent, expected.grandparent);
  deepStrictEqual(actual.grandparent?.data, expected.grandparent?.data);
  deepStrictEqual(actual.height, expected.height);
  deepStrictEqual(actual.left, expected.left);
  deepStrictEqual(actual.left?.data, expected.left?.data);
  deepStrictEqual(actual.right, expected.right);
  deepStrictEqual(actual.right?.data, expected.right?.data);
  deepStrictEqual(actual.max, expected.max);
  deepStrictEqual(actual.max?.data, expected.max?.data);
  deepStrictEqual(actual.min, expected.min);
  deepStrictEqual(actual.min?.data, expected.min?.data);
  deepStrictEqual(actual.parent, expected.parent);
  deepStrictEqual(actual.parent?.data, expected.parent?.data);
  deepStrictEqual(actual.sibling, expected.sibling);
  deepStrictEqual(actual.sibling?.data, expected.sibling?.data);
  deepStrictEqual(actual.size, expected.size);
  deepStrictEqual(actual.uncle, expected.uncle);
  deepStrictEqual(actual.uncle?.data, expected.uncle?.data);
  deepStrictEqual(actual.width, expected.width);
}

function assertIterator<T = unknown>(
  actual: BSTree<T>,
  ...expected: Node<T>[]
): void {
  let i = 0;

  for (const node of actual) {
    assertNode(node, expected[i++]);
  }

  deepStrictEqual(i, expected.length);
  deepStrictEqual(
    actual.array,
    expected.map(({ data }) => data)
  );
}

suite("BSTree", () => {
  const tree = new BSTree<number>();
  let node0: Node<number>;
  let node1: Node<number>;
  let node2: Node<number>;
  let node3: Node<number>;
  let node4: Node<number>;
  let node5: Node<number>;
  let node6: Node<number>;

  test(".insert()", () => {
    assertTree<number>(tree, {
      height: -1,
      max: null,
      min: null,
      size: 0,
      width: 0,
    });
    deepStrictEqual(tree.find(3), null);

    // Insert 3
    node3 = tree.insert(3);
    deepStrictEqual(node3, tree.insert(3));
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
    deepStrictEqual(tree.find(3), node3);

    // Insert 5
    node5 = tree.insert(5);
    deepStrictEqual(node5, tree.insert(5));
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
    deepStrictEqual(tree.find(5), node5);

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
    deepStrictEqual(tree.find(4), node4);

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
    deepStrictEqual(tree.find(6), node6);

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
    deepStrictEqual(tree.find(1), node1);

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
    deepStrictEqual(tree.find(0), node0);

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
      node6
    );
    deepStrictEqual(tree.find(2), node2);
  });

  test(".from()", () => {
    const input = [3, 1, 0, 2, 5, 4, 6];
    const other_tree = BSTree.from(input);

    assertTree<number>(other_tree, {
      height: 2,
      max: node6,
      min: node0,
      size: 7,
      width: 4,
    });
  });

  test(".delete()", () => {
    // remove 3
    deepStrictEqual(tree.delete(3), { node: node4, success: true });
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
    deepStrictEqual(tree.delete(3), { node: null });
    assertIterator<number>(tree, node0, node1, node2, node4, node5, node6);
    deepStrictEqual(tree.find(3), null);

    // remove 1
    deepStrictEqual(tree.delete(1), { node: node2, success: true });
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
    deepStrictEqual(tree.delete(1), { node: null });
    assertIterator<number>(tree, node0, node2, node4, node5, node6);
    deepStrictEqual(tree.find(1), null);

    // remove 2
    deepStrictEqual(tree.delete(2), { node: node0, success: true });
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
    deepStrictEqual(tree.delete(2), { node: null });
    assertIterator<number>(tree, node0, node4, node5, node6);
    deepStrictEqual(tree.find(2), null);

    // remove 5
    deepStrictEqual(tree.delete(5), { node: node6, success: true });
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
    deepStrictEqual(tree.delete(5), { node: null });
    assertIterator<number>(tree, node0, node4, node6);
    deepStrictEqual(tree.find(5), null);

    // remove 6
    deepStrictEqual(tree.delete(6), { node: node4, success: true });
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
    deepStrictEqual(tree.delete(6), { node: null });
    assertIterator<number>(tree, node0, node4);
    deepStrictEqual(tree.find(6), null);

    // remove 4
    deepStrictEqual(tree.delete(4), { node: node0, success: true });
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
    deepStrictEqual(tree.delete(4), { node: null });
    assertIterator<number>(tree, node0);
    deepStrictEqual(tree.find(4), null);

    // insert 4
    node4 = tree.insert(4);
    deepStrictEqual(tree.find(4), node4);

    // remove 0
    deepStrictEqual(tree.delete(0), { node: node4, success: true });
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
    deepStrictEqual(tree.delete(0), { node: null });
    assertIterator<number>(tree, node4);
    deepStrictEqual(tree.find(0), null);

    // remove 4
    deepStrictEqual(tree.delete(4), { node: null, success: true });
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
    deepStrictEqual(tree.delete(4), { node: null });
    assertIterator<number>(tree);
    deepStrictEqual(tree.find(4), null);

    // insert 4 and 3
    node4 = tree.insert(4);
    node3 = tree.insert(3);
    deepStrictEqual(tree.find(4), node4);
    deepStrictEqual(tree.find(3), node3);

    // remove 3
    deepStrictEqual(tree.delete(3), { node: node4, success: true });
    deepStrictEqual(tree.find(4), node4);
    deepStrictEqual(tree.find(3), null);
    deepStrictEqual(tree.delete(3), { node: null });
    assertIterator<number>(tree, node4);

    // insert 0 and 2
    node0 = tree.insert(0);
    node2 = tree.insert(2);
    deepStrictEqual(tree.find(2), node2);
    deepStrictEqual(tree.find(0), node0);

    // remove 0
    deepStrictEqual(tree.delete(0), { node: node2, success: true });
    deepStrictEqual(tree.find(4), node4);
    deepStrictEqual(tree.find(2), node2);
    deepStrictEqual(tree.find(0), null);
    deepStrictEqual(tree.delete(0), { node: null });
    assertIterator<number>(tree, node2, node4);

    // insert 0
    node0 = tree.insert(0);
    deepStrictEqual(tree.find(0), node0);

    // remove 2 and 4
    deepStrictEqual(tree.delete(2), { node: node0, success: true });
    deepStrictEqual(tree.delete(4), { node: node0, success: true });
    deepStrictEqual(tree.find(4), null);
    deepStrictEqual(tree.find(0), node0);
    deepStrictEqual(tree.find(2), null);

    // insert 2, 1 and 3
    node2 = tree.insert(2);
    node1 = tree.insert(1);
    node3 = tree.insert(3);
    deepStrictEqual(tree.find(0), node0);
    deepStrictEqual(tree.find(1), node1);
    deepStrictEqual(tree.find(2), node2);
    deepStrictEqual(tree.find(3), node3);

    // remove 2, 1, 3 and 0
    deepStrictEqual(tree.delete(2), { node: node3, success: true });
    deepStrictEqual(tree.delete(3), { node: node1, success: true });
    deepStrictEqual(tree.delete(1), { node: node0, success: true });
    deepStrictEqual(tree.delete(0), { node: null, success: true });
  });

  test("empty iterator", () => {
    const iterator = tree[Symbol.iterator]();
    deepStrictEqual(typeof iterator.next().value, "undefined");
    deepStrictEqual(typeof iterator.next().value, "undefined");
  });

  test("throw an error when set value is not an instance of the `Node`", () => {
    const newTree = new BSTree<number>();
    const node = newTree.insert(2);
    const error = new TypeError(
      "`node` is not an instance of the class `Node`"
    );
    throws(() => {
      node.left = {} as unknown as Node<number>;
    }, error);
    throws(() => {
      node.right = {} as unknown as Node<number>;
    }, error);
  });
});
