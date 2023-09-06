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

type IDir = "left" | "right";

export class BSTree<T = unknown> implements Iterable<Node<T>> {
  #root: Node<T> | null;
  readonly #comparator: IComparator<T>;

  public constructor(
    comparator = (a: T, b: T): number => (a < b ? -1 : a > b ? 1 : 0),
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
  public find(
    data: T,
    { upsert = false }: INodeFindOptions = {},
  ): Node<T> | null {
    if (!this.#root) {
      return upsert ? (this.#root = new Node<T>(data)) : null;
    }

    let next: Node<T> | null = this.#root;
    let current: Node<T>;
    let cmp: number;
    let dir: IDir;

    do {
      current = next;
      cmp = this.#comparator(current.data, data);

      if (cmp === 0) {
        return current;
      }

      dir = BSTree.getDir(cmp);
      next = current[dir];
    } while (next);

    return upsert ? (current[dir] = new Node<T>(data)) : null;
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
          parent[BSTree.getDir(parent, node)] = null;
        } else {
          this.#root = null;
        }

        return { node: parent, success: true };
      }

      node.right = null;

      if (parent) {
        parent[BSTree.getDir(parent, node)] = right;
      } else {
        this.#root = right;
      }

      return { node: right, success: true };
    } else if (!right) {
      node.left = null;

      if (parent) {
        parent[BSTree.getDir(parent, node)] = left;
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
      parent[BSTree.getDir(parent, node)] = min;
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

  public static getDir(compare_result: number): IDir;
  public static getDir<T = unknown>(parent: Node<T>, child: Node<T>): IDir;
  public static getDir<T = unknown>(
    parent: Node<T> | number,
    child?: Node<T>,
  ): IDir {
    if (!child) {
      if (typeof parent !== "number") {
        throw new TypeError("Compare result is not a number");
      } else if (parent < 0) {
        return "right";
      } else if (parent > 0) {
        return "left";
      }
      throw new TypeError("Compare result must be a nonzero number");
    } else if (!(parent instanceof Node)) {
      throw new TypeError("Parent must be a valid Node");
    } else if (parent.left === child) {
      return "left";
    } else if (parent.right === child) {
      return "right";
    }
    throw new TypeError("Invalid `parent-child` pair");
  }

  public static from<T = unknown>(
    iterable: Iterable<T>,
    comparator?: IComparator<T>,
  ): BSTree<T> {
    const tree = new BSTree<T>(comparator);
    for (const a of iterable) {
      tree.insert(a);
    }
    return tree;
  }
}
