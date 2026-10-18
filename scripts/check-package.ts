/**
 * Packs the library, installs the tarball into a temporary project and checks
 * that it can be imported, required and type-checked the way consumers do.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface IPackResult {
  filename: string;
  files: { path: string }[];
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** The TypeScript compilers to check consumers with (`npm:` aliases). */
const compilers = {
  current: join(root, "node_modules", "typescript", "bin", "tsc"),
  // The oldest version for ES module consumers (`IteratorObject`)
  esm: join(root, "node_modules", "typescript-5.6", "bin", "tsc"),
  // The oldest version for CommonJS consumers (`require(esm)` with nodenext)
  cjs: join(root, "node_modules", "typescript-5.8", "bin", "tsc"),
  // The newest major version (the native compiler)
  latest: join(root, "node_modules", "typescript-7", "bin", "tsc"),
};
const work = mkdtempSync(join(tmpdir(), "bstrees-package-"));

const required = [
  "package.json",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "MIGRATION.md",
  "dist/index.js",
  "dist/index.d.ts",
];
const forbidden = /^(?:bench|coverage|docs|scripts|test|dist\/test)\//u;

const esm = `
import { deepEqual, equal, rejects } from "node:assert/strict";
import { AVLTree, BSTree } from "bstrees";

const tree = AVLTree.from([3, 1, 2]);
deepEqual(tree.toArray(), [1, 2, 3]);
deepEqual(tree.values().map((value) => value * 2).toArray(), [2, 4, 6]);
equal(new BSTree().size, 0);
await rejects(import("bstrees/dist/internal/core.js"), {
  code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
});
`;

const cjs = `
const { deepEqual, equal } = require("node:assert/strict");
const { AVLTree } = require("bstrees");
const { name } = require("bstrees/package.json");

deepEqual(AVLTree.from([2, 1]).toArray(), [1, 2]);
equal(name, "bstrees");
`;

const commonjs = `
import { AVLTree, type SortedTree } from "bstrees";

export const tree: SortedTree<number> = AVLTree.from([2, 1]);
export const descending = AVLTree.from([1, 2], (a, b) => b - a);
`;

const consumer = `
import { AVLTree, BSTree, type SortedTree } from "bstrees";

interface IOrder {
  price: number;
}

const tree: SortedTree<number> = AVLTree.from([1, 2, 3]);
const orders = new BSTree<IOrder>((a, b) => a.price - b.price);

export const size: number = tree.size;
export const min: number | undefined = tree.min();
export const order: IOrder = orders.getOrInsert({ price: 1 });

// @ts-expect-error -- objects require a comparator
export const invalid = new AVLTree<IOrder>();

// @ts-expect-error -- \`Node\` is not exported anymore
export type RemovedNode = import("bstrees").Node;

// The values give the comparator parameters their types
export const descending = AVLTree.from([1, 2], (a, b) => b - a);
export const words = BSTree.from(["b", "a"], (a, b) => a.localeCompare(b));
export const prices = AVLTree.from([{ price: 2 }], (a, b) => a.price - b.price);

// The declarations keep the value type of a subclass
class Numbers extends AVLTree<number> {}
const byString = (a: number | string, b: number | string): number =>
  String(a).localeCompare(String(b));

export const numbers: AVLTree<number> = Numbers.from([2, 1]);

// @ts-expect-error -- a subclass of number trees cannot hold strings
export const wrongValues = Numbers.from(["a"]);

// @ts-expect-error -- not even with an explicit type argument
export const wrongUnion = Numbers.from<number | string>(["a"], byString);

// @ts-expect-error -- a tree of literals is not a tree of numbers
export const literals: SortedTree<number> = AVLTree.from<1 | 2>([1, 2]);
`;

function run(command: string, args: string[], cwd: string): string {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
}

function writeJSON(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

try {
  execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit" });

  const results = JSON.parse(
    run(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", work],
      root,
    ),
  ) as IPackResult[];
  const pack = results.at(0);

  if (!pack) {
    throw new Error("`npm pack` returned no results");
  }

  const files = pack.files.map(({ path }) => path);
  const missing = required.filter((file) => !files.includes(file));
  const extra = files.filter((file) => forbidden.test(file));

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `Unexpected package contents. Missing: [${missing.join(", ")}], ` +
        `extra: [${extra.join(", ")}]`,
    );
  }

  const project = join(work, "consumer");
  mkdirSync(project);
  writeJSON(join(project, "package.json"), {
    name: "consumer",
    private: true,
    type: "module",
  });
  run(
    "npm",
    [
      "install",
      join(work, pack.filename),
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
    ],
    project,
  );

  writeFileSync(join(project, "esm.js"), esm);
  writeFileSync(join(project, "cjs.cjs"), cjs);
  run(process.execPath, ["esm.js"], project);
  run(process.execPath, ["cjs.cjs"], project);

  writeFileSync(join(project, "consumer.ts"), consumer);

  for (const [module, moduleResolution] of [
    ["nodenext", "nodenext"],
    ["preserve", "bundler"],
  ]) {
    const config = `tsconfig.${moduleResolution}.json`;
    writeJSON(join(project, config), {
      compilerOptions: {
        module,
        moduleResolution,
        noEmit: true,
        strict: true,
        target: "esnext",
        types: [],
      },
      files: ["consumer.ts"],
    });

    for (const tsc of [compilers.current, compilers.esm, compilers.latest]) {
      run(process.execPath, [tsc, "-p", config], project);
    }
  }

  // A CommonJS consumer: its own `package.json`, the same `node_modules`
  const cjsProject = join(project, "commonjs");
  mkdirSync(cjsProject);
  writeJSON(join(cjsProject, "package.json"), { type: "commonjs" });
  writeFileSync(join(cjsProject, "consumer.ts"), commonjs);
  writeJSON(join(cjsProject, "tsconfig.json"), {
    compilerOptions: {
      module: "nodenext",
      moduleResolution: "nodenext",
      noEmit: true,
      strict: true,
      target: "esnext",
      types: [],
    },
    files: ["consumer.ts"],
  });

  for (const tsc of [compilers.current, compilers.cjs, compilers.latest]) {
    run(process.execPath, [tsc, "-p", "tsconfig.json"], cjsProject);
  }

  process.stdout.write(
    `${pack.filename}: ${files.length} files, all checks passed\n`,
  );
} finally {
  rmSync(work, { force: true, recursive: true });
}
