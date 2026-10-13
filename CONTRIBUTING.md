# Contributing

Thanks for contributing to `bstrees`.

## Development

The development tooling requires Node.js 24 or newer. Install dependencies
with:

```bash
npm ci
```

Run the checks that cover most changes with:

```bash
npm test
npm run eslint
npm run typecheck
npm run prettier
```

`npm run coverage` runs the tests with coverage thresholds (use Node.js 26: the
line coverage reported by Node.js 24 is imprecise), and
`npm run test:package` packs the library and checks that the tarball installs
and imports correctly. Use `npm run docs:build` when a public API changes and
`npm run bench` for changes that may affect performance.

## Pull requests

Keep pull requests focused and include tests for behavior changes. Commits are
validated with Conventional Commits rules in CI, so use a matching commit
message such as `fix: rebalance the tree after deletion`.

Review the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.
