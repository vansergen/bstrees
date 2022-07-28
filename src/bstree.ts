import { Node } from "./node.js";
import { TreeIterator } from "./iterator.js";

export type IComparator<T = unknown> = (a: T, b: T) => number;

export interface INodeDeleteResult<T = unknown> {
  node: Node<T> | null;
  success?: true;
}

export interface INodeFindOptions {
  upsert?: boolean;
}

export class BSTree<T = unknown> implements Iterable<Node<T>> {
  #root: Node<T> | null;
  readonly #comparator: IComparator<T>;

  public constructor(
    comparator = (a: T, b: T): number => (a < b ? -1 : a > b ? 1 : 0)
  ) {
    this.#root = null;
    this.#comparator = comparator;
  }

  public [Symbol.iterator](): TreeIterator<T> {
    return new TreeIterator<T>(this.#root);
  }

  public get size(): number {
    return this.#root?.size ?? 0;
  }

  protected set root(node: Node<T> | null) {
    this.#root = node;
  }

  public get min(): Node<T> | null {
    return this.#root?.min ?? null;
  }

  public get max(): Node<T> | null {
    return this.#root?.max ?? null;
  }

  public get height(): number {
    return this.#root?.height ?? -1;
  }

  public get width(): number {
    return this.#root?.width ?? 0;
  }

  public insert(data: T): Node<T> {
    return this.find(data, { upsert: true });
  }

  public find(data: T): Node<T> | null;
  public find(data: T, options: { upsert: true }): Node<T>;
  public find(data: T, { upsert }: INodeFindOptions = {}): Node<T> | null {
    if (!this.#root) {
      return upsert ? (this.#root = new Node<T>(data)) : null;
    }

    let cmp = this.#comparator(this.#root.data, data);

    if (cmp === 0) {
      return this.#root;
    }

    let dir: "left" | "right" = cmp < 0 ? "right" : "left";

    let node: Node<T> = this.#root;

    while (node[dir]) {
      node = node[dir] as Node<T>;

      cmp = this.#comparator(node.data, data);

      if (cmp === 0) {
        return node;
      }

      dir = cmp < 0 ? "right" : "left";
    }

    return upsert ? (node[dir] = new Node<T>(data)) : null;
  }

  public delete(data: T): INodeDeleteResult<T> {
    const node = this.find(data);

    if (!node) {
      return { node: null };
    }

    const { left, right, parent } = node;

    if (!left) {
      if (!right) {
        if (parent) {
          parent[parent.left === node ? "left" : "right"] = null;
        } else {
          this.#root = null;
        }

        return { node: parent, success: true };
      }

      node.right = null;

      if (parent) {
        parent[parent.left === node ? "left" : "right"] = right;
      } else {
        this.#root = right;
      }

      return { node: right, success: true };
    } else if (!right) {
      node.left = null;

      if (parent) {
        parent[parent.left === node ? "left" : "right"] = left;
      } else {
        this.#root = left;
      }

      return { node: left, success: true };
    }

    const { min } = right;

    const { parent: min_parent } = min;

    if (min_parent?.left === min) {
      min_parent.left = min.right;
    }

    node.left = null;
    node.right = null;

    if (parent) {
      parent[parent.left === node ? "left" : "right"] = min;
    } else {
      this.#root = min;
    }

    min.left = left;

    if (right !== min) {
      const { right: min_right } = min;
      const min_right_parent = min_right?.parent;

      min.right = right;

      if (min_right_parent) {
        min_right_parent.left = min_right;
      }

      return { node: min_parent, success: true };
    }

    return { node: min, success: true };
  }

  public get array(): T[] {
    const array: T[] = [];

    for (const { data } of this) {
      array.push(data);
    }

    return array;
  }

  public static from<T = unknown>(
    iterable: Iterable<T>,
    comparator?: IComparator<T>
  ): BSTree<T> {
    const tree = new BSTree<T>(comparator);
    for (const a of iterable) {
      tree.insert(a);
    }
    return tree;
  }
}
