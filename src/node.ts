export class Node<T = unknown> {
  #right: Node<T> | null;
  #left: Node<T> | null;
  #parent: Node<T> | null;
  readonly #data: T;

  public constructor(data: T) {
    this.#left = null;
    this.#right = null;
    this.#parent = null;
    this.#data = data;
  }

  public get data(): T {
    return this.#data;
  }

  public get size(): number {
    const nodes: Node<T>[] = [];

    let size = 0;

    nodes.push(this);

    while (nodes.length) {
      size += nodes.length;

      Node.#nextLevel(nodes);
    }

    return size;
  }

  public get height(): number {
    const nodes: Node<T>[] = [];

    let height = -1;

    nodes.push(this);

    while (nodes.length) {
      height += 1;

      Node.#nextLevel(nodes);
    }

    return height;
  }

  public get width(): number {
    const nodes: Node<T>[] = [];

    let width = 0;

    nodes.push(this);

    while (nodes.length) {
      const { length } = nodes;

      if (length > width) {
        width = length;
      }

      Node.#nextLevel(nodes);
    }

    return width;
  }

  public get left(): Node<T> | null {
    return this.#left;
  }

  public set left(node: Node<T> | null) {
    if (node !== null && !(node instanceof Node)) {
      throw new TypeError("`node` is not an instance of the class `Node`");
    }

    if (this.#left) {
      this.#left.#parent = null;
    }

    if (node) {
      node.#parent = this;
    }

    this.#left = node;
  }

  public get right(): Node<T> | null {
    return this.#right;
  }

  public set right(node: Node<T> | null) {
    if (node && !(node instanceof Node)) {
      throw new TypeError("`node` is not an instance of the class `Node`");
    }

    if (this.#right) {
      this.#right.#parent = null;
    }

    if (node) {
      node.#parent = this;
    }

    this.#right = node;
  }

  public get parent(): Node<T> | null {
    return this.#parent;
  }

  public get grandparent(): Node<T> | null {
    return this.parent?.parent ?? null;
  }

  public get sibling(): Node<T> | null {
    if (!this.parent) {
      return null;
    }

    return this.parent.left === this ? this.parent.right : this.parent.left;
  }

  public get uncle(): Node<T> | null {
    return this.parent?.sibling ?? null;
  }

  public get min(): Node<T> {
    let min = this as Node<T>;

    while (min.left) {
      min = min.left;
    }

    return min;
  }

  public get max(): Node<T> {
    let max = this as Node<T>;

    while (max.right) {
      max = max.right;
    }

    return max;
  }

  static #nextLevel<T = unknown>(nodes: Node<T>[]): void {
    const { length } = nodes;

    for (let i = 0; i < length; i += 1) {
      const node = nodes.shift();

      if (node?.left) {
        nodes.push(node.left);
      }

      if (node?.right) {
        nodes.push(node.right);
      }
    }
  }
}
