/** A tree node. Never exposed outside of the library. */
export class TreeNode<T> {
  public value: T;
  public parent: TreeNode<T> | null;
  public left: TreeNode<T> | null;
  public right: TreeNode<T> | null;
  /** The number of nodes on the longest path down to a leaf (a leaf has 1). */
  public height: number;

  public constructor(value: T, parent: TreeNode<T> | null) {
    this.value = value;
    this.parent = parent;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

export function heightOf<T>(node: TreeNode<T> | null): number {
  return node?.height ?? 0;
}

export function minNode<T>(node: TreeNode<T>): TreeNode<T> {
  let current = node;

  while (current.left) {
    current = current.left;
  }

  return current;
}

export function maxNode<T>(node: TreeNode<T>): TreeNode<T> {
  let current = node;

  while (current.right) {
    current = current.right;
  }

  return current;
}

/** Returns the next node in the sort order. */
export function successor<T>(node: TreeNode<T>): TreeNode<T> | null {
  if (node.right) {
    return minNode(node.right);
  }

  let child = node;
  let { parent } = node;

  while (parent?.right === child) {
    child = parent;
    ({ parent } = parent);
  }

  return parent;
}

/** Returns the previous node in the sort order. */
export function predecessor<T>(node: TreeNode<T>): TreeNode<T> | null {
  if (node.left) {
    return maxNode(node.left);
  }

  let child = node;
  let { parent } = node;

  while (parent?.left === child) {
    child = parent;
    ({ parent } = parent);
  }

  return parent;
}
