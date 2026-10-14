# Changelog

## [3.0.0](https://github.com/vvenv/janja/compare/janja-cli-v2.0.1...janja-cli-v3.0.0) (2026-10-14)


### ⚠ BREAKING CHANGES

* **janja-cli:** janja-cli requires Node.js 22.12 or later, as commander 15 does.

### Bug Fixes

* **janja-cli:** upgrade commander to 15 and chokidar to 5 ([09be32d](https://github.com/vvenv/janja/commit/09be32db64b99a54cd6cc2bc5909ec95dceed4f7))

## [2.0.1](https://github.com/vvenv/janja/compare/janja-cli-v2.0.0...janja-cli-v2.0.1) (2026-10-13)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * janja bumped to 4.0.0

## [2.0.0](https://github.com/vvenv/janja/compare/janja-cli-v1.0.0...janja-cli-v2.0.0) (2026-10-13)


### ⚠ BREAKING CHANGES

* **janja-cli:** the format of compiled files changed, and the unused `--watch` flag of `compile` was removed in favour of the `watch` command.

### Features

* add CLI, integration examples, and new core features ([4a8420a](https://github.com/vvenv/janja/commit/4a8420a3aed8047decef838ca78dd96575d6318f))
* **janja-cli:** emit loadable modules, resolve includes, add check and format commands ([560ca4d](https://github.com/vvenv/janja/commit/560ca4dc039ec22381a66fc68843e81394aa7b37))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * janja bumped to 3.0.0
