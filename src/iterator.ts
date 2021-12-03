import type { Node } from "./node.js";

export class TreeIterator<T = unknown> implements Iterator<Node<T>> {
  readonly #root: Node<T> | null;
  #done: boolean;
  #cursor?: Node<T>;

  public constructor(node: Node<T> | null) {
    this.#root = node;
    this.#done = false;
  }

  public next(): IteratorResult<Node<T>> {
    if (this.#done) {
      return { done: true } as IteratorReturnResult<undefined>;
    } else if (!this.#root) {
      this.#done = true;
      return { done: true } as IteratorReturnResult<undefined>;
    }

    if (!this.#cursor || this.#cursor.right) {
      this.#cursor = (this.#cursor?.right ?? this.#root).min;
      return { value: this.#cursor, done: false };
    }

    while (
      this.#cursor.parent?.right === this.#cursor &&
      this.#root !== this.#cursor
    ) {
      this.#cursor = this.#cursor.parent;
    }

    if (!this.#cursor.parent || this.#root === this.#cursor) {
      this.#done = true;
      return { done: true } as IteratorReturnResult<undefined>;
    }

    this.#cursor = this.#cursor.parent;

    return { value: this.#cursor, done: false };
  }
}
