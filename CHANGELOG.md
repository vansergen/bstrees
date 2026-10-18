# Changelog

## [3.0.0](https://github.com/vansergen/bstrees/compare/v2.0.0...v3.0.0) (2026-10-18)

### ⚠ BREAKING CHANGES

* replace the node-based API with a Set-like value API (see MIGRATION.md)
* publish a self-contained ESM package for Node.js >=24

### Features

* accept explicit `undefined` range bounds in the types ([68fad03](https://github.com/vansergen/bstrees/commit/68fad035e4bc146ca260060fd115df0ad7ab390e))
* accept explicit type arguments in `from` ([7cf96d9](https://github.com/vansergen/bstrees/commit/7cf96d9c2d49137d80ed913db80f470479ab750d))
* call the comparator without a receiver ([1c4811b](https://github.com/vansergen/bstrees/commit/1c4811b904c094834f47fdcce54755cdd4d09ce7))
* check range bounds against the stored values ([c5d5e9b](https://github.com/vansergen/bstrees/commit/c5d5e9b0c8ebdce08fc657a3928b3c6f264674bc))
* create instances of a subclass in `from()` ([b7d9297](https://github.com/vansergen/bstrees/commit/b7d9297e5c276df63da41cff4e61f3aa7ea1916d))
* reject modifications of a tree from its own comparator ([56ba26d](https://github.com/vansergen/bstrees/commit/56ba26d2bda3ff80e3e8265e95c15fbe1f0c0bce))
* replace the node-based API with a Set-like value API (see MIGRATION.md) ([f8046e8](https://github.com/vansergen/bstrees/commit/f8046e88489321997a991f1fe42e25db72da1046))
* type `from` for generic number, string and bigint types ([34845db](https://github.com/vansergen/bstrees/commit/34845db08d26d276bd206746b68d4993ad3812f5))
* validate the comparator and its results strictly ([f076614](https://github.com/vansergen/bstrees/commit/f076614968ed2b2b4270f138771af19faa7b2618))
* validate values on empty trees too ([26f9a8c](https://github.com/vansergen/bstrees/commit/26f9a8c3be1fe4d0e3058eb1ff1939809b19ec42))

### Performance Improvements

* add an iterative tree core with O(log n) AVL rebalancing ([2380354](https://github.com/vansergen/bstrees/commit/23803543048ce08023bf307d5be16ab4d1bd6427))

### Build System

* publish a self-contained ESM package for Node.js >=24 ([60ed62c](https://github.com/vansergen/bstrees/commit/60ed62cd65ee9ae480927a56612feea50d0d38d6))

## [2.0.0](https://github.com/vansergen/bstrees/compare/v1.1.5...v2.0.0) (2024-04-08)

### ⚠ BREAKING CHANGES

- drop `Node.js` `<18.20.1` support

### Performance Improvements

- drop `Node.js` `<18.20.1` support ([adc3fb6](https://github.com/vansergen/bstrees/commit/adc3fb65144229ea60674fbf6bead7a372644f9a))

## [1.1.5](https://github.com/vansergen/bstrees/compare/v1.1.4...v1.1.5) (2022-07-31)

### Performance Improvements

- add validation of node relations ([9514dbd](https://github.com/vansergen/bstrees/commit/9514dbdb1bf5e24a34886e8716c04f2c3469a487))

### [1.1.4](https://github.com/vansergen/bstrees/compare/v1.1.3...v1.1.4) (2022-06-24)

### Performance Improvements

- do not use recursion in the `size` getter ([2b15769](https://github.com/vansergen/bstrees/commit/2b15769b7f74669a1296285904e64f03df5037de))

### [1.1.3](https://github.com/vansergen/bstrees/compare/v1.1.2...v1.1.3) (2021-12-08)

### Bug Fixes

- update parent links after deletion ([fb3301d](https://github.com/vansergen/bstrees/commit/fb3301d0ce0fbd6e2a1311a327f4acb3390f729f)), closes [#5](https://github.com/vansergen/bstrees/issues/5)

### [1.1.2](https://github.com/vansergen/bstrees/compare/v1.1.1...v1.1.2) (2021-12-06)

### Performance Improvements

- remove recursion from the `height` method ([72d05e4](https://github.com/vansergen/bstrees/commit/72d05e4e84623948bae3a5f9fe9a1f0b5cd50468))

### [1.1.1](https://github.com/vansergen/bstrees/compare/v1.1.0...v1.1.1) (2021-12-06)

### Performance Improvements

- add `comparator` to the `.from()` method ([1a19281](https://github.com/vansergen/bstrees/commit/1a192815340a2a62e5bc64e276e3f2c8c37758c7))

## [1.1.0](https://github.com/vansergen/bstrees/compare/v1.0.0...v1.1.0) (2021-12-03)

### Features

- add the `AVLTree` class ([ea4e001](https://github.com/vansergen/bstrees/commit/ea4e00154bd4ebeb31039748b6a01586e7811564))

## 1.0.0 (2021-12-03)

### Features

- add the `BSTree` class ([93584a3](https://github.com/vansergen/bstrees/commit/93584a30912838d03359ec8e8b2528521de8348b))

### Metadata

- `npm int` ([08a25d9](https://github.com/vansergen/bstrees/commit/08a25d99c6cf41426db311cace263f7995f1f2b6))
