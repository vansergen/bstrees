import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import config from "@binden/eslint-config-ts";

export default [
  ...config,
  { rules: { "sort-imports": "off" } },
  {
    languageOptions: {
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
      },
    },
  },
  { ignores: ["dist/*", "docs/*", "coverage/*", "eslint.config.js"] },
];
