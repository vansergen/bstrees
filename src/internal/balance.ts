import { type TreeNode, heightOf } from "./node.js";

/** The part of the tree core that rebalancing needs. */
export interface IRoot<T> {
  root: TreeNode<T> | null;
  readonly balanced: boolean;
}

function update<T>(node: TreeNode<T>): TreeNode<T> {
  node.height = 1 + Math.max(heightOf(node.left), heightOf(node.right));
  return node;
}

function replaceChild<T>(
  tree: IRoot<T>,
  parent: TreeNode<T> | null,
  child: TreeNode<T>,
  replacement: TreeNode<T>,
): void {
  replacement.parent = parent;

  if (!parent) {
    tree.root = replacement;
  } else if (parent.left === child) {
    parent.left = replacement;
  } else {
    parent.right = replacement;
  }
}

/** Rotates `node` left around its right child `pivot`. */
function rotateLeft<T>(
  tree: IRoot<T>,
  node: TreeNode<T>,
  pivot: TreeNode<T>,
): TreeNode<T> {
  const { left: inner } = pivot;

  replaceChild(tree, node.parent, node, pivot);
  node.right = inner;

  if (inner) {
    inner.parent = node;
  }

  pivot.left = node;
  node.parent = pivot;
  update(node);

  return update(pivot);
}

/** Rotates `node` right around its left child `pivot`. */
function rotateRight<T>(
  tree: IRoot<T>,
  node: TreeNode<T>,
  pivot: TreeNode<T>,
): TreeNode<T> {
  const { right: inner } = pivot;

  replaceChild(tree, node.parent, node, pivot);
  node.left = inner;

  if (inner) {
    inner.parent = node;
  }

  pivot.right = node;
  node.parent = pivot;
  update(node);

  return update(pivot);
}

/**
 * Restores the AVL property at `node` (whose children are valid AVL trees
 * with heights differing by at most 2) and returns the new subtree root.
 */
function rebalance<T>(tree: IRoot<T>, node: TreeNode<T>): TreeNode<T> {
  const { left, right } = node;
  const balance = heightOf(left) - heightOf(right);

  if (balance > 1 && left) {
    const { right: inner } = left;

    if (heightOf(left.left) < heightOf(inner) && inner) {
      return rotateRight(tree, node, rotateLeft(tree, left, inner));
    }

    return rotateRight(tree, node, left);
  }

  if (balance < -1 && right) {
    const { left: inner } = right;

    if (heightOf(right.right) < heightOf(inner) && inner) {
      return rotateLeft(tree, node, rotateRight(tree, right, inner));
    }

    return rotateLeft(tree, node, right);
  }

  return update(node);
}

/**
 * Walks up from `start` after an insertion or a removal below it, updating the
 * stored heights and rebalancing AVL trees. Stops as soon as the height of a
 * subtree did not change, since its ancestors are then unaffected. This keeps
 * an AVL insertion or removal at O(log n).
 */
export function retrace<T>(tree: IRoot<T>, start: TreeNode<T> | null): void {
  let node = start;

  while (node) {
    const { height } = node;
    const top = tree.balanced ? rebalance(tree, node) : update(node);

    if (top.height === height) {
      return;
    }

    node = top.parent;
  }
}
