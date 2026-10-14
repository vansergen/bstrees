import { typeName } from "../compare.js";
import type { Comparator } from "../types.js";
import { type IRoot, retrace } from "./balance.js";
import { TreeNode, maxNode, minNode } from "./node.js";

/**
 * The state and the algorithms shared by all trees. Every loop is iterative,
 * so even a degenerate (list-shaped) tree cannot overflow the stack. The
 * comparator is only called before a mutation starts, so a throwing
 * comparator leaves the tree unchanged.
 */
export class TreeCore<T> implements IRoot<T> {
  public root: TreeNode<T> | null;
  public size: number;
  /** Incremented on every mutation, so iterators can notice them. */
  public version: number;
  public readonly balanced: boolean;
  readonly #compare: Comparator<T>;

  public constructor(compare: Comparator<T>, balanced: boolean) {
    this.root = null;
    this.size = 0;
    this.version = 0;
    this.balanced = balanced;
    this.#compare = compare;
  }

  /** Compares two values and validates the result of the comparator. */
  public compare(a: T, b: T): number {
    // Called without a receiver, so the comparator cannot reach the tree.
    const compare = this.#compare;
    const result: unknown = compare(a, b);

    if (typeof result === "number" && !Number.isNaN(result)) {
      return result;
    }

    throw new TypeError(
      `The comparator must return a number other than NaN, got ${typeName(result)}`,
    );
  }

  public first(): TreeNode<T> | null {
    const { root } = this;
    return root && minNode(root);
  }

  public last(): TreeNode<T> | null {
    const { root } = this;
    return root && maxNode(root);
  }

  /** Returns the node that holds a value equal to `value`. */
  public find(value: T): TreeNode<T> | null {
    let node = this.root;

    while (node) {
      const order = this.compare(value, node.value);

      if (order === 0) {
        return node;
      }

      node = order < 0 ? node.left : node.right;
    }

    return null;
  }

  /**
   * Returns the node with the greatest value below `value` (`below = true`)
   * or with the least value above it (`below = false`). Equal values are
   * accepted when `inclusive` is `true`.
   */
  public bound(
    value: T,
    below: boolean,
    inclusive: boolean,
  ): TreeNode<T> | null {
    let node = this.root;
    let best: TreeNode<T> | null = null;

    while (node) {
      const order = this.compare(value, node.value);

      if (order === 0 && inclusive) {
        return node;
      }

      if (below) {
        if (order > 0) {
          best = node;
          node = node.right;
        } else {
          node = node.left;
        }
      } else if (order < 0) {
        best = node;
        node = node.left;
      } else {
        node = node.right;
      }
    }

    return best;
  }

  /** Returns the node holding an equal value, inserting `value` if needed. */
  public insert(value: T): TreeNode<T> {
    let parent: TreeNode<T> | null = null;
    let node = this.root;
    let order = 0;

    if (!node && this.compare(value, value) !== 0) {
      throw new TypeError(
        "The comparator must return 0 when a value is compared with itself",
      );
    }

    while (node) {
      order = this.compare(value, node.value);

      if (order === 0) {
        return node;
      }

      parent = node;
      node = order < 0 ? node.left : node.right;
    }

    const created = new TreeNode(value, parent);

    if (!parent) {
      this.root = created;
    } else if (order < 0) {
      parent.left = created;
    } else {
      parent.right = created;
    }

    this.size += 1;
    this.version += 1;
    retrace(this, parent);

    return created;
  }

  /** Removes a node that belongs to this tree. */
  public remove(target: TreeNode<T>): void {
    let node = target;

    if (node.left && node.right) {
      // Nodes are never exposed, so the successor's value can move in here.
      const next = minNode(node.right);
      node.value = next.value;
      node = next;
    }

    const child = node.left ?? node.right;
    const { parent } = node;

    if (child) {
      child.parent = parent;
    }

    if (!parent) {
      this.root = child;
    } else if (parent.left === node) {
      parent.left = child;
    } else {
      parent.right = child;
    }

    node.parent = null;
    node.left = null;
    node.right = null;
    this.size -= 1;
    this.version += 1;
    retrace(this, parent);
  }

  public clear(): void {
    this.root = null;
    this.size = 0;
    this.version += 1;
  }
}
