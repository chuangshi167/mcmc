# mcmc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Markov Chain Monte Carlo

## Introduction

This project is an implementation of Metropolis-Hastings algorithm to simulate graphs, and will find the most probable graphs based on user's input.
```sh
$f(\left\{s_i, X_i\right\},(\left\{s_j, X_j\right\} ) = e^{-(\theta(s_i, Xj) -\theta(s_j, Xi)/T}$
```
## Installation

```sh
$ npm install --save mcmc
```

## Usage

```js
const mcmc = require('mcmc');

mcmc('Rainbow');
```
## License

MIT © [Zane]()


[npm-image]: https://badge.fury.io/js/mcmc.svg
[npm-url]: https://npmjs.org/package/mcmc
[travis-image]: https://travis-ci.org/chuangshi167/mcmc.svg?branch=master
[travis-url]: https://travis-ci.org/chuangshi167/mcmc
[daviddm-image]: https://david-dm.org/chuangshi167/mcmc.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/chuangshi167/mcmc
[coveralls-image]: https://coveralls.io/repos/chuangshi167/mcmc/badge.svg
[coveralls-url]: https://coveralls.io/r/chuangshi167/mcmc
