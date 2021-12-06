import { deepStrictEqual, ok } from "node:assert";
import { AVLTree, BSTree } from "../index.js";
import type { Node } from "../src/node.js";

suite("AVLTree", () => {
  suite("insertion", () => {
    /**
     *           3
     *         /  \
     *        1   4
     *      /  \
     *     0    2
     */
    const cases_left = [
      { name: "left-left case", data: [4, 3, 2, 1, 0] },
      { name: "left-right case", data: [4, 2, 3, 0, 1] },
      { name: "right-left case", data: [2, 4, 3, 0, 1] },
      { name: "right-right case", data: [2, 3, 4, 0, 1] },
      { name: "no rotations", data: [3, 4, 1, 2, 0] },
    ];

    for (const { name, data } of cases_left) {
      test(
        `${name} (${data.join(", ")}):\n` +
          "    3\n" +
          "   / \\" +
          "\n" +
          "  1   4\n" +
          " / \\" +
          "\n" +
          "0   2\n",
        () => {
          const tree = new AVLTree<number>();
          const nodes = [] as Node<number>[];

          for (const item of data) {
            nodes[item] = tree.insert(item);
            ok(AVLTree.isAVL<number>(tree));
          }

          deepStrictEqual(tree.height, 2);
          deepStrictEqual(tree.max?.data, nodes[4].data);
          deepStrictEqual(tree.min?.data, nodes[0].data);
          deepStrictEqual(tree.size, 5);
          deepStrictEqual(tree.width, 2);

          deepStrictEqual(nodes[4].data, 4);
          deepStrictEqual(nodes[4].grandparent, null);
          deepStrictEqual(nodes[4].height, 0);
          deepStrictEqual(nodes[4].left, null);
          deepStrictEqual(nodes[4].right, null);
          deepStrictEqual(nodes[4].max?.data, nodes[4]?.data);
          deepStrictEqual(nodes[4].min?.data, nodes[4]?.data);
          deepStrictEqual(nodes[4].parent?.data, nodes[3]?.data);
          deepStrictEqual(nodes[4].sibling?.data, nodes[1]?.data);
          deepStrictEqual(nodes[4].size, 1);
          deepStrictEqual(nodes[4].uncle, null);
          deepStrictEqual(nodes[4].width, 1);

          deepStrictEqual(nodes[3].data, 3);
          deepStrictEqual(nodes[3].grandparent, null);
          deepStrictEqual(nodes[3].height, 2);
          deepStrictEqual(nodes[3].left, nodes[1]);
          deepStrictEqual(nodes[3].right, nodes[4]);
          deepStrictEqual(nodes[3].max, nodes[4]);
          deepStrictEqual(nodes[3].min, nodes[0]);
          deepStrictEqual(nodes[3].parent, null);
          deepStrictEqual(nodes[3].sibling, null);
          deepStrictEqual(nodes[3].size, 5);
          deepStrictEqual(nodes[3].uncle, null);
          deepStrictEqual(nodes[3].width, 2);

          deepStrictEqual(nodes[2].data, 2);
          deepStrictEqual(nodes[2].grandparent, nodes[3]);
          deepStrictEqual(nodes[2].height, 0);
          deepStrictEqual(nodes[2].left, null);
          deepStrictEqual(nodes[2].right, null);
          deepStrictEqual(nodes[2].max, nodes[2]);
          deepStrictEqual(nodes[2].min, nodes[2]);
          deepStrictEqual(nodes[2].parent, nodes[1]);
          deepStrictEqual(nodes[2].sibling, nodes[0]);
          deepStrictEqual(nodes[2].size, 1);
          deepStrictEqual(nodes[2].uncle, nodes[4]);
          deepStrictEqual(nodes[2].width, 1);

          deepStrictEqual(nodes[1].data, 1);
          deepStrictEqual(nodes[1].grandparent, null);
          deepStrictEqual(nodes[1].height, 1);
          deepStrictEqual(nodes[1].left, nodes[0]);
          deepStrictEqual(nodes[1].right, nodes[2]);
          deepStrictEqual(nodes[1].max, nodes[2]);
          deepStrictEqual(nodes[1].min, nodes[0]);
          deepStrictEqual(nodes[1].parent, nodes[3]);
          deepStrictEqual(nodes[1].sibling, nodes[4]);
          deepStrictEqual(nodes[1].size, 3);
          deepStrictEqual(nodes[1].uncle, null);
          deepStrictEqual(nodes[1].width, 2);

          deepStrictEqual(nodes[0].data, 0);
          deepStrictEqual(nodes[0].grandparent, nodes[3]);
          deepStrictEqual(nodes[0].height, 0);
          deepStrictEqual(nodes[0].left, null);
          deepStrictEqual(nodes[0].right, null);
          deepStrictEqual(nodes[0].max, nodes[0]);
          deepStrictEqual(nodes[0].min, nodes[0]);
          deepStrictEqual(nodes[0].parent, nodes[1]);
          deepStrictEqual(nodes[0].sibling, nodes[2]);
          deepStrictEqual(nodes[0].size, 1);
          deepStrictEqual(nodes[0].uncle, nodes[4]);
          deepStrictEqual(nodes[0].width, 1);
        }
      );
    }

    /**
     *           1
     *         /  \
     *        0   3
     *           / \
     *          2  4
     */
    const cases_right = [
      { name: "left-left case", data: [4, 1, 0, 3, 2] },
      { name: "left-right case", data: [4, 0, 1, 2, 3] },
      { name: "right-left case", data: [0, 2, 1, 4, 3] },
      { name: "right-right case", data: [0, 1, 2, 3, 4] },
      { name: "no rotations", data: [1, 3, 0, 2, 4] },
    ];

    for (const { name, data } of cases_right) {
      test(
        `${name} (${data.join(", ")}):\n` +
          "  1\n" +
          " / \\" +
          "\n" +
          "0   3\n" +
          "   / \\" +
          "\n" +
          "  2   4",
        () => {
          const tree = new AVLTree<number>();
          const nodes = [] as Node<number>[];

          for (const item of data) {
            nodes[item] = tree.insert(item);
            ok(AVLTree.isAVL<number>(tree));
          }

          deepStrictEqual(tree.height, 2);
          deepStrictEqual(tree.max?.data, nodes[4]?.data);
          deepStrictEqual(tree.min?.data, nodes[0]?.data);
          deepStrictEqual(tree.size, 5);
          deepStrictEqual(tree.width, 2);

          deepStrictEqual(nodes[4].data, 4);
          deepStrictEqual(nodes[4].grandparent?.data, nodes[1].data);
          deepStrictEqual(nodes[4].height, 0);
          deepStrictEqual(nodes[4].left, null);
          deepStrictEqual(nodes[4].right, null);
          deepStrictEqual(nodes[4].max?.data, nodes[4].data);
          deepStrictEqual(nodes[4].min?.data, nodes[4].data);
          deepStrictEqual(nodes[4].parent?.data, nodes[3].data);
          deepStrictEqual(nodes[4].sibling?.data, nodes[2].data);
          deepStrictEqual(nodes[4].size, 1);
          deepStrictEqual(nodes[4].uncle?.data, nodes[0].data);
          deepStrictEqual(nodes[4].width, 1);

          deepStrictEqual(nodes[3].data, 3);
          deepStrictEqual(nodes[3].grandparent, null);
          deepStrictEqual(nodes[3].height, 1);
          deepStrictEqual(nodes[3].left?.data, nodes[2]?.data);
          deepStrictEqual(nodes[3].right?.data, nodes[4]?.data);
          deepStrictEqual(nodes[3].max?.data, nodes[4]?.data);
          deepStrictEqual(nodes[3].min?.data, nodes[2]?.data);
          deepStrictEqual(nodes[3].parent?.data, nodes[1]?.data);
          deepStrictEqual(nodes[3].sibling?.data, nodes[0]?.data);
          deepStrictEqual(nodes[3].size, 3);
          deepStrictEqual(nodes[3].uncle, null);
          deepStrictEqual(nodes[3].width, 2);

          deepStrictEqual(nodes[2].data, 2);
          deepStrictEqual(nodes[2].grandparent?.data, nodes[1]?.data);
          deepStrictEqual(nodes[2].height, 0);
          deepStrictEqual(nodes[2].left, null);
          deepStrictEqual(nodes[2].right, null);
          deepStrictEqual(nodes[2].max?.data, nodes[2]?.data);
          deepStrictEqual(nodes[2].min?.data, nodes[2]?.data);
          deepStrictEqual(nodes[2].parent?.data, nodes[3]?.data);
          deepStrictEqual(nodes[2].sibling?.data, nodes[4]?.data);
          deepStrictEqual(nodes[2].size, 1);
          deepStrictEqual(nodes[2].uncle?.data, nodes[0]?.data);
          deepStrictEqual(nodes[2].width, 1);

          deepStrictEqual(nodes[1].data, 1);
          deepStrictEqual(nodes[1].grandparent, null);
          deepStrictEqual(nodes[1].height, 2);
          deepStrictEqual(nodes[1].left?.data, nodes[0]?.data);
          deepStrictEqual(nodes[1].right?.data, nodes[3]?.data);
          deepStrictEqual(nodes[1].max?.data, nodes[4]?.data);
          deepStrictEqual(nodes[1].min?.data, nodes[0]?.data);
          deepStrictEqual(nodes[1].parent, null);
          deepStrictEqual(nodes[1].sibling, null);
          deepStrictEqual(nodes[1].size, 5);
          deepStrictEqual(nodes[1].uncle, null);
          deepStrictEqual(nodes[1].width, 2);

          deepStrictEqual(nodes[0].data, 0);
          deepStrictEqual(nodes[0].grandparent, null);
          deepStrictEqual(nodes[0].height, 0);
          deepStrictEqual(nodes[0].left, null);
          deepStrictEqual(nodes[0].right, null);
          deepStrictEqual(nodes[0].max?.data, nodes[0]?.data);
          deepStrictEqual(nodes[0].min?.data, nodes[0]?.data);
          deepStrictEqual(nodes[0].parent?.data, nodes[1]?.data);
          deepStrictEqual(nodes[0].sibling?.data, nodes[3]?.data);
          deepStrictEqual(nodes[0].size, 1);
          deepStrictEqual(nodes[0].uncle, null);
          deepStrictEqual(nodes[0].width, 1);
        }
      );
    }
  });

  suite("deletion", () => {
    /**
     *           3
     *         /  \
     *        1   4
     *      /  \
     *     0    2
     */
    const cases_left = [
      { name: "left-left case", data: [4, 3, 2, 1, 0] },
      { name: "left-left case", data: [2, 4, 3, 1, 0] },
      { name: "left-right case", data: [0, 4, 3, 2, 1] },
      { name: "left-right case", data: [4, 0, 3, 2, 1] },
      { name: "no rotations", data: [3, 4, 1, 2, 0] },
    ];

    for (const { name, data } of cases_left) {
      test(
        `${name} (${data.join(", ")}):\n` +
          "    3\n" +
          "   / \\" +
          "\n" +
          "  1   4\n" +
          " / \\" +
          "\n" +
          "0   2\n",
        () => {
          const tree = new AVLTree<number>();

          tree.insert(3);
          tree.insert(4);
          tree.insert(1);
          tree.insert(0);
          tree.insert(2);

          for (const item of data) {
            const { success } = tree.delete(item);
            ok(success);
            AVLTree.isAVL<number>(tree);
          }

          deepStrictEqual(tree.height, -1);
          deepStrictEqual(tree.max, null);
          deepStrictEqual(tree.min, null);
          deepStrictEqual(tree.size, 0);
          deepStrictEqual(tree.width, 0);
        }
      );
    }

    /**
     *           1
     *         /  \
     *        0   3
     *           / \
     *          2  4
     */
    const cases_right = [
      { name: "left-left case", data: [4, 1, 0, 3, 2] },
      { name: "left-right case", data: [4, 0, 1, 2, 3] },
      { name: "right-left case", data: [0, 2, 1, 4, 3] },
      { name: "right-right case", data: [0, 1, 2, 3, 4] },
      { name: "no rotations", data: [1, 3, 0, 2, 4] },
    ];

    for (const { name, data } of cases_right) {
      test(
        `${name} (${data.join(", ")}):\n` +
          "  1\n" +
          " / \\" +
          "\n" +
          "0   3\n" +
          "   / \\" +
          "\n" +
          "  2   4",
        () => {
          const tree = new AVLTree<number>();

          tree.find(4, { upsert: true });
          tree.find(0, { upsert: true });
          tree.find(1, { upsert: true });
          tree.find(2, { upsert: true });
          tree.find(3, { upsert: true });

          for (const item of data) {
            const { success } = tree.delete(item);
            ok(success);
            AVLTree.isAVL<number>(tree);
          }

          deepStrictEqual(tree.height, -1);
          deepStrictEqual(tree.max, null);
          deepStrictEqual(tree.min, null);
          deepStrictEqual(tree.size, 0);
          deepStrictEqual(tree.width, 0);
        }
      );
    }
  });

  test(".isAVL()", () => {
    const tree = new BSTree<number>();
    deepStrictEqual(AVLTree.isAVL(tree), true);
    tree.insert(1);
    deepStrictEqual(AVLTree.isAVL(tree), true);
    tree.insert(2);
    deepStrictEqual(AVLTree.isAVL(tree), true);
    tree.insert(3);
    deepStrictEqual(AVLTree.isAVL(tree), false);
    tree.insert(0);
    deepStrictEqual(AVLTree.isAVL(tree), true);
  });

  test(".from() (default comparator)", () => {
    const input = [4, 0, 1, 2, 3];
    const tree = AVLTree.from(input);
    deepStrictEqual(tree.height, 2);
    deepStrictEqual(tree.max?.data, 4);
    deepStrictEqual(tree.min?.data, 0);
    deepStrictEqual(tree.size, 5);
    deepStrictEqual(tree.width, 2);
    AVLTree.isAVL(tree);
    deepStrictEqual(tree.array, input.sort());
  });

  test(".from()", () => {
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
    const other_tree = AVLTree.from(input, Comparator);
    deepStrictEqual(other_tree.array, input.sort(Comparator));
  });
});
