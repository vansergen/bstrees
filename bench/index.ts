/**
 * Benchmarks `AVLTree` and `BSTree` against a sorted array and a `Set`.
 *
 * Usage: `npm run bench [-- --markdown] [-- --sizes=1000,10000]`
 */
import { Bench, type FnOptions } from "tinybench";

import { AVLTree, BSTree, type SortedTree } from "../src/index.js";

/** The minimal API every benchmarked structure provides. */
interface IStructure {
  readonly size: number;
  insert(value: number): void;
  has(value: number): boolean;
  delete(value: number): void;
  popMin(): void;
  /** Sums the values in `[from, to)`. */
  range(from: number, to: number): number;
  values(): Iterable<number>;
}

interface IImplementation {
  readonly name: string;
  /** Skips sorted insertions above this size (an unbalanced tree is O(n²)). */
  readonly maxSortedInsert?: number;
  /** Whether the structure keeps its values ordered. */
  readonly ordered: boolean;
  create(): IStructure;
}

type Task = [() => unknown, FnOptions];

interface IScenario {
  readonly name: string;
  task(implementation: IImplementation, size: number): Task | null;
}

/** A sorted array with binary search: the simplest ordered structure. */
class SortedArray implements IStructure {
  readonly #values: number[] = [];

  public get size(): number {
    return this.#values.length;
  }

  public insert(value: number): void {
    const index = this.#search(value);

    if (this.#values[index] !== value) {
      this.#values.splice(index, 0, value);
    }
  }

  public has(value: number): boolean {
    return this.#values[this.#search(value)] === value;
  }

  public delete(value: number): void {
    const index = this.#search(value);

    if (this.#values[index] === value) {
      this.#values.splice(index, 1);
    }
  }

  public popMin(): void {
    this.#values.shift();
  }

  public range(from: number, to: number): number {
    let sum = 0;
    let index = this.#search(from);
    let value = this.#values[index] ?? to;

    while (value < to) {
      sum += value;
      index += 1;
      value = this.#values[index] ?? to;
    }

    return sum;
  }

  public values(): Iterable<number> {
    return this.#values;
  }

  /** Returns the index of the first value that is not less than `value`. */
  #search(value: number): number {
    let low = 0;
    let high = this.#values.length;

    while (low < high) {
      const middle = Math.floor((low + high) / 2);

      if ((this.#values[middle] ?? value) < value) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    return low;
  }
}

class TreeStructure implements IStructure {
  readonly #tree: SortedTree<number>;

  public constructor(tree: SortedTree<number>) {
    this.#tree = tree;
  }

  public get size(): number {
    return this.#tree.size;
  }

  public insert(value: number): void {
    this.#tree.insert(value);
  }

  public has(value: number): boolean {
    return this.#tree.has(value);
  }

  public delete(value: number): void {
    this.#tree.delete(value);
  }

  public popMin(): void {
    this.#tree.popMin();
  }

  public range(from: number, to: number): number {
    let sum = 0;

    for (const value of this.#tree.range({ gte: from, lt: to })) {
      sum += value;
    }

    return sum;
  }

  public values(): Iterable<number> {
    return this.#tree;
  }
}

/** An unordered baseline: only insert, has and delete are measured. */
class SetStructure implements IStructure {
  readonly #set = new Set<number>();

  public get size(): number {
    return this.#set.size;
  }

  public insert(value: number): void {
    this.#set.add(value);
  }

  public has(value: number): boolean {
    return this.#set.has(value);
  }

  public delete(value: number): void {
    this.#set.delete(value);
  }

  public popMin(): void {
    throw new Error(`Not supported by a set of ${String(this.size)} values`);
  }

  public range(): number {
    throw new Error(`Not supported by a set of ${String(this.size)} values`);
  }

  public values(): Iterable<number> {
    return this.#set;
  }
}

const implementations: IImplementation[] = [
  {
    name: "AVLTree",
    ordered: true,
    create: (): IStructure => new TreeStructure(new AVLTree<number>()),
  },
  {
    name: "BSTree",
    maxSortedInsert: 10_000,
    ordered: true,
    create: (): IStructure => new TreeStructure(new BSTree<number>()),
  },
  {
    name: "sorted array",
    ordered: true,
    create: (): IStructure => new SortedArray(),
  },
  { name: "Set", ordered: false, create: (): IStructure => new SetStructure() },
];

/** Returns `0..size-1` in a deterministic random order. */
function shuffled(size: number): number[] {
  const values = Array.from({ length: size }, (_, index) => index);
  let seed = 42;

  for (let index = size - 1; index > 0; index -= 1) {
    seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
    const other = seed % (index + 1);
    const value = values[index] ?? 0;
    values[index] = values[other] ?? 0;
    values[other] = value;
  }

  return values;
}

function filled(implementation: IImplementation, values: number[]): IStructure {
  const structure = implementation.create();

  for (const value of values) {
    structure.insert(value);
  }

  return structure;
}

/** Measures `run` on a freshly filled structure every iteration. */
function onFilled(
  implementation: IImplementation,
  values: number[],
  run: (structure: IStructure) => void,
): Task {
  let structure = implementation.create();

  return [
    (): void => {
      run(structure);
    },
    {
      beforeEach: (): void => {
        structure = filled(implementation, values);
      },
    },
  ];
}

const scenarios: IScenario[] = [
  {
    name: "insert (random order)",
    task: (implementation, size): Task => {
      const values = shuffled(size);
      return [(): IStructure => filled(implementation, values), {}];
    },
  },
  {
    name: "insert (sorted order)",
    task: (implementation, size): Task | null => {
      if (size > (implementation.maxSortedInsert ?? size)) {
        return null;
      }

      const values = Array.from({ length: size }, (_, index) => index);
      return [(): IStructure => filled(implementation, values), {}];
    },
  },
  {
    name: "has (every value)",
    task: (implementation, size): Task => {
      const values = shuffled(size);
      const structure = filled(implementation, values);

      return [(): boolean => values.every((value) => structure.has(value)), {}];
    },
  },
  {
    name: "delete (every value)",
    task: (implementation, size): Task => {
      const values = shuffled(size);

      return onFilled(implementation, values, (structure) => {
        for (const value of values) {
          structure.delete(value);
        }
      });
    },
  },
  {
    name: "iterate in order",
    task: (implementation, size): Task | null => {
      if (!implementation.ordered) {
        return null;
      }

      const structure = filled(implementation, shuffled(size));

      return [
        (): number => {
          let sum = 0;

          for (const value of structure.values()) {
            sum += value;
          }

          return sum;
        },
        {},
      ];
    },
  },
  {
    name: "range (1000 × 100 values)",
    task: (implementation, size): Task | null => {
      if (!implementation.ordered) {
        return null;
      }

      const structure = filled(implementation, shuffled(size));
      const starts = shuffled(1000).map((value) => value % (size - 100));

      return [
        (): number =>
          starts.reduce(
            (sum, start) => sum + structure.range(start, start + 100),
            0,
          ),
        {},
      ];
    },
  },
  {
    name: "popMin (until empty)",
    task: (implementation, size): Task | null => {
      if (!implementation.ordered) {
        return null;
      }

      return onFilled(implementation, shuffled(size), (structure) => {
        while (structure.size > 0) {
          structure.popMin();
        }
      });
    },
  },
];

function format(milliseconds: number): string {
  return milliseconds >= 100
    ? `${milliseconds.toFixed(0)} ms`
    : `${milliseconds.toPrecision(2)} ms`;
}

async function measure(scenario: IScenario, size: number): Promise<string[]> {
  const bench = new Bench({
    iterations: size >= 100_000 ? 3 : 10,
    time: 0,
    warmupIterations: 1,
    warmupTime: 0,
  });

  for (const implementation of implementations) {
    const task = scenario.task(implementation, size);

    if (task) {
      bench.add(implementation.name, ...task);
    }
  }

  await bench.run();
  process.stderr.write(`${scenario.name}, n = ${String(size)}: done\n`);

  return [
    scenario.name,
    size.toLocaleString("en-US"),
    ...implementations.map(({ name }) => {
      const result = bench.tasks.find((task) => task.name === name)?.result;
      return result?.state === "completed" ? format(result.latency.mean) : "—";
    }),
  ];
}

const sizes = process.argv
  .find((argument) => argument.startsWith("--sizes="))
  ?.slice("--sizes=".length)
  .split(",")
  .map(Number) ?? [1000, 10_000, 100_000];
const header = ["Scenario", "n", ...implementations.map(({ name }) => name)];
const rows: string[][] = [];

for (const scenario of scenarios) {
  for (const size of sizes) {
    // Benchmarks run one after another so they do not disturb each other.
    rows.push(await measure(scenario, size));
  }
}

if (process.argv.includes("--markdown")) {
  const lines = [header, header.map(() => "---"), ...rows].map(
    (cells) => `| ${cells.join(" | ")} |`,
  );
  process.stdout.write(`${lines.join("\n")}\n`);
} else {
  const widths = header.map((_, column) =>
    Math.max(...[header, ...rows].map((cells) => cells[column]?.length ?? 0)),
  );

  for (const cells of [header, ...rows]) {
    const line = cells.map((cell, column) => cell.padEnd(widths[column] ?? 0));
    process.stdout.write(`${line.join("  ")}\n`);
  }
}
