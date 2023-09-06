import { BSTree, IComparator, INodeDeleteResult } from "./bstree.js";
import type { Node } from "./node.js";

export class AVLTree<T = unknown> extends BSTree<T> {
  public insert(data: T): Node<T> {
    const node = super.insert(data);

    this.#rebalance(node.parent, true);

    return node;
  }

  public delete(data: T): INodeDeleteResult<T> {
    const { node, success } = super.delete(data);

    if (!success) {
      return { node };
    } else if (!node) {
      return { node, success };
    }

    this.#rebalance(node);

    return { node, success };
  }

  #rebalance(node: Node<T> | null, stop = false): void {
    let next = node;

    while (next) {
      const { parent } = next;

      const hb = AVLTree.heightBalance<T>(next);

      if (stop && hb === 0) {
        break;
      } else if (hb < -1) {
        const { right } = next;

        if (right) {
          const rightHB = AVLTree.heightBalance<T>(right);

          if (rightHB > 0) {
            this.#rightRotate(right);
          }
        }

        this.#leftRotate(next);
      } else if (hb > 1) {
        const { left } = next;

        if (left) {
          const leftHB = AVLTree.heightBalance<T>(left);

          if (leftHB < 0) {
            this.#leftRotate(left);
          }
        }

        this.#rightRotate(next);
      }

      next = parent;
    }
  }

  #leftRotate(node: Node<T>): void {
    const { right, parent } = node;

    if (right) {
      node.right = null;

      if (parent) {
        parent[BSTree.getDir(parent, node)] = right;
      } else {
        this.root = right;
      }

      const { left } = right;

      right.left = node;
      node.right = left;
    }
  }

  #rightRotate(node: Node<T>): void {
    const { left, parent } = node;

    if (left) {
      node.left = null;

      if (parent) {
        parent[BSTree.getDir(parent, node)] = left;
      } else {
        this.root = left;
      }

      const { right } = left;

      left.right = node;
      node.left = right;
    }
  }

  public static heightBalance<T = unknown>(node: Node<T> | null): number {
    return (node?.left?.height ?? -1) - (node?.right?.height ?? -1);
  }

  public static isAVL<T = unknown>(tree: BSTree<T>): boolean {
    for (const node of tree) {
      const hb = AVLTree.heightBalance<T>(node);

      if (hb < -1 || hb > 1) {
        return false;
      }
    }

    return true;
  }

  public static from<T = unknown>(
    iterable: Iterable<T>,
    comparator?: IComparator<T>,
  ): AVLTree<T> {
    const tree = new AVLTree<T>(comparator);
    for (const a of iterable) {
      tree.insert(a);
    }
    return tree;
  }
}
