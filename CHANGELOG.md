# Changelog

## [0.2.3](https://github.com/kyozen-sys/PhantomPool/compare/v0.2.2...v0.2.3) (2026-05-30)


### Bug Fixes

* **browser:** prevent /tmp orphan dirs from accumulating across restarts ([46403ed](https://github.com/kyozen-sys/PhantomPool/commit/46403ed5654c132ccb3d31b7a6be0a32341676a2))

## [0.2.2](https://github.com/kyozen-sys/PhantomPool/compare/v0.2.1...v0.2.2) (2026-05-25)


### Bug Fixes

* **browser:** cleanup user data dir on browser death to prevent disk leak ([684973f](https://github.com/kyozen-sys/PhantomPool/commit/684973f7b22275031edba9d11bf4eeafccb5a8fe))

## [0.2.1](https://github.com/kyozen-sys/PhantomPool/compare/v0.2.0...v0.2.1) (2026-05-22)


### Bug Fixes

* **docker:** run from source instead of compiled binary ([19d0ba4](https://github.com/kyozen-sys/PhantomPool/commit/19d0ba48be2d27bce8188e8c32b6d3f27777c4f0))

## [0.2.0](https://github.com/kyozen-sys/PhantomPool/compare/v0.1.0...v0.2.0) (2026-05-22)


### Features

* **browser:** crash recovery and browser rotation ([a5358af](https://github.com/kyozen-sys/PhantomPool/commit/a5358afa84a000bf94e1dcccf48b62b74f79e7bd))
* **docs:** serve OpenAPI reference at /docs via Scalar ([620c431](https://github.com/kyozen-sys/PhantomPool/commit/620c4316df5d84250763ff3b7212f15594da67ae))
* **pool:** crash recovery, graceful close and lease lifecycle hardening ([c51681f](https://github.com/kyozen-sys/PhantomPool/commit/c51681f39393e50c9c3cb996e41629032a77b919))
* **server:** graceful shutdown on SIGTERM/SIGINT ([8db9109](https://github.com/kyozen-sys/PhantomPool/commit/8db9109e0396e6222684d2ff8e76106d7faed41a))


### Bug Fixes

* **browser:** temporary userDir ([09f9354](https://github.com/kyozen-sys/PhantomPool/commit/09f9354a7c037fa63e4eb1bceb7597cd708e3611))
