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
const tsc = join(root, "node_modules", "typescript", "bin", "tsc");
const work = mkdtempSync(join(tmpdir(), "bstrees-package-"));

const required = [
  "package.json",
  "README.md",
  "LICENSE",
  "dist/index.js",
  "dist/index.d.ts",
];
const forbidden = /^(?:bench|coverage|docs|scripts|test|dist\/test)\//u;

const esm = `
import { deepEqual, equal, rejects } from "node:assert/strict";
import { AVLTree, BSTree } from "bstrees";

const tree = AVLTree.from([3, 1, 2]);
deepEqual(tree.array, [1, 2, 3]);
equal(new BSTree().size, 0);
await rejects(import("bstrees/dist/node.js"), {
  code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
});
`;

const cjs = `
const { deepEqual, equal } = require("node:assert/strict");
const { AVLTree } = require("bstrees");
const { name } = require("bstrees/package.json");

deepEqual(AVLTree.from([2, 1]).array, [1, 2]);
equal(name, "bstrees");
`;

const consumer = `
import { AVLTree, BSTree } from "bstrees";

const tree: BSTree<number> = AVLTree.from([1, 2, 3]);
export const size: number = tree.size;
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
    run(process.execPath, [tsc, "-p", config], project);
  }

  process.stdout.write(
    `${pack.filename}: ${files.length} files, all checks passed\n`,
  );
} finally {
  rmSync(work, { force: true, recursive: true });
}
