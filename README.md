# mcmc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Markov Chain Monte Carlo

## Introduction

This project is an implementation of Metropolis-Hastings algorithm to simulate graphs, and will find the most probable graphs based on user's input.
```sh
![](http://latex.codecogs.com/gif.latex?%24f%28%5Cleft%5C%7Bs_i%2C%20X_i%5Cright%5C%7D%2C%28%5Cleft%5C%7Bs_j%2C%20X_j%5Cright%5C%7D%20%29%20%3D%20e%5E%7B-%28%5Ctheta%28s_i%2C%20Xj%29%20-%5Ctheta%28s_j%2C%20Xi%29/T%7D%24)
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
