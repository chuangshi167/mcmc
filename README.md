# mcmc [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Markov Chain Monte Carlo

## Introduction

This project is an implementation of Metropolis-Hastings algorithm to simulate graphs, and will find the most probable graphs based on user's input and the following equation


![](http://latex.codecogs.com/gif.latex?%24f%28%5Cleft%5C%7Bs_i%2C%20X_i%5Cright%5C%7D%2C%28%5Cleft%5C%7Bs_j%2C%20X_j%5Cright%5C%7D%20%29%20%3D%20e%5E%7B-%28%5Ctheta%28s_i%2C%20Xj%29%20-%5Ctheta%28s_j%2C%20Xi%29%29/T%7D%24)

in which,

![](http://latex.codecogs.com/gif.latex?%24%5Ctheta%28s_i%2C%20X_i%29%20%3D%20r%20%5Csum_%7Be%7D%20w_e%20&plus;%20%5Csum_%7Bk%7D%5E%7BM%7D%5Csum_%7Be%5Cin%20P_s_i%20k%7Dw_e%20%24)

In this equation, the first sum is the sum of the weight of all the edges in the graph, and the second sum is the total weight of the shortest path from the source node to the other nodes.

The proposal distribution can be calculated by

![](http://latex.codecogs.com/gif.latex?q%28j%7Ci%29%20%3D%20%5Cfrac%7B1%7D%7BE%20-%20B%7D)

in which B is the number of bridges, and bridges are the edges without which the graph will be disconnected, in the situation when an edge is removed from the current state.

If instead of removing an edge, an edge is added to the current graph, the proposal distribution is given by:

![](http://latex.codecogs.com/gif.latex?q%28i%7Cj%29%20%3D%20%5Cfrac%7B1%7D%7B%5Cfrac%7BM%20*%20%28M%20-%201%29%7D%7B2%7D%20-%20E%7D)

in which the Mterm stands for the number of edges in a complete graph with the same numbe of nodes, and the E term is the number of existing edges in the current state.

The probabity of the acceptance of the proposal is defined by the function:

![](http://latex.codecogs.com/gif.latex?A%20%3D%20min%5C%7B%20%5Cfrac%7B%5Cpi_j*q%28i%7Cj%29%7D%7B%5Cpi_i%20*q%28j%7Ci%29%7D%5C%7D)

## Arguments
There are
```js

--number: the number of nodes. Default is 5

--coordinates: the coordinate of nodes. Default is 0,0,1,0,-1,0,0,1,0,-1

--r: the r facotr in theta equation. Default is 1

--T: the T factor in f equation. Default is 0.1 (When T is near to 0, only the optimial proposal can be accepted. The larger the T is, the more likely a proposal will be accepted)

--iterations: the number of iterations. Default is 1000

--sourceNode: the source node. Default is node 0

```
## Usage

```js

node lib/index.js

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
