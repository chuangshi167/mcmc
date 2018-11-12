const assert = require('assert');
const mcmc = require('../lib/index.js');
const jsnx = require('jsnetworkx');

describe('mcmc', () => {
  it('set default correct', () => {
    var inputValue = mcmc.setDefault({});
    assert.equal(inputValue.r, 1);
    assert.equal(inputValue.T, 0.1);
    assert.equal(inputValue.number, 5);
  });
  it('create a graph', () => {
    var G = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    assert.equal(G.nodes().length, 5);
    assert.equal(G.edges().length, 5);
  });
  it('find a distance', () => {
    var G = new jsnx.Graph();
    G.addNode(0, { coordinate: [0, 0] });
    G.addNode(1, { coordinate: [3, 4] });
    var distance = mcmc.distance(G, 0, 1);
    assert.equal(5, distance);
  });
  it('check dfs is working correctly', () => {
    var G = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    assert.equal(mcmc.dfs(G).toString(), '0,1,4,2,3');
  });
  it('check if the graph is connected', () => {
    var G = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    assert.equal(mcmc.isConnected(G), true);
    G.removeEdge(1, 2);
    G.removeEdge(0, 1);
    assert.equal(mcmc.isConnected(G), false);
  });
  it('creates the correct adjacency matrix', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3, 4]);
    G.addWeightedEdgesFrom([[0, 1, 3], [1, 2, 7], [1, 3, 4], [3, 4, 1], [0, 2, 2]]);
    var matrix = mcmc.adjacencyMatrix(G);
    var matrix2 = [
      [0, 3, 2, 0, 0],
      [3, 0, 7, 4, 0],
      [2, 7, 0, 0, 0],
      [0, 4, 0, 0, 1],
      [0, 0, 0, 1, 0]
    ];
    for (var i = 0; i < G.nodes().length; i++) {
      for (var j = 0; j < G.nodes().length; j++) {
        assert.equal(matrix[i][j], matrix2[i][j]);
      }
    }
  });
  it('check if two graph are identical', () => {
    var Gi = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    var Gj = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);

    assert.equal(mcmc.isEqual(Gi, Gj), true);
    Gj.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    assert.equal(mcmc.isEqual(Gi, Gj), false);
  });
  it('clone the graph completely and correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var Gj = mcmc.cloneGraph(Gi);
    assert.equal(mcmc.dfs(Gi).toString(), mcmc.dfs(Gj).toString());
    Gj.removeEdge(0, 1);
    assert.equal(mcmc.dfs(Gi).toString() !== mcmc.dfs(Gj).toString(), true);
  });
  it('check if the edge is a bridge', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3], {
      coordinate: [[0, 0], [0, 1], [1, 0], [[0, -1], [1, 2]]]
    });
    G.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 2, 1]]);
    assert(mcmc.isBridge(G, 0, 3));
    assert(!mcmc.isBridge(G, 0, 1));
    assert(!mcmc.isBridge(G, 0, 2));
    assert(!mcmc.isBridge(G, 1, 2));
  });
  it('calculates theta correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var thetai = mcmc.theta(Gi, 10, 0);
    assert.equal(thetai, 44);
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gj.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    var thetaj = mcmc.theta(Gj, 10, 0);
    assert.equal(thetaj, 42 + 11 * Math.sqrt(2));
    var Gk = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    var thetak = mcmc.theta(Gk, 1, 0);
    assert.equal(thetak, 14 + Math.sqrt(2));
    var Gl = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    Gl.removeEdge(0, 1);
    var thetal = mcmc.theta(Gl, 1, 0);
    assert.equal(thetal, 17 + 3 * Math.sqrt(2));
  });
  it('calculates pi_j over pi_i correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gj.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    assert.equal(
      mcmc.pijOverpii(Gj, Gi, 200, 10, 0),
      Math.exp((2 - 11 * Math.sqrt(2)) / 200)
    );
    assert.equal(
      mcmc.pijOverpii(Gi, Gj, 200, 10, 0),
      Math.exp((11 * Math.sqrt(2) - 2) / 200)
    );
  });
  it('add a random edge correctly', () => {
    var G = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 5);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 6);
    assert(G.neighbors(1).includes(3));
    assert(G.neighbors(0).includes(2));
  });
  it('remove a random edge correctly', () => {
    var G = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.removeRandomEdge(G);
    assert.equal(G.edges().length, 3);
  });
  it('calculate proposal distribution correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var Gk = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.removeRandomEdge(Gj);
    mcmc.addRandomEdge(Gk);
    assert.equal(mcmc.proposalDistribution(Gj, Gi), 1 / 4);
    assert.equal(mcmc.proposalDistribution(Gi, Gj), 1 / 3);
    assert.equal(mcmc.proposalDistribution(Gk, Gi), 0.5);
    assert.equal(mcmc.proposalDistribution(Gi, Gk), 0.2);
  });
  it('determine add/remove edge correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gi.removeEdge(0, 3);
    Gj.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)], [1, 3, Math.sqrt(2)]]);
    assert(mcmc.addOrRemove(Gi));
    assert(!mcmc.addOrRemove(Gj));
  });
  it('convert the corridinates from string to array correctly', () => {
    var coordinates = '0,0,1,1,-1,-1';
    assert.equal(
      mcmc.convert(coordinates).toString(),
      [[0, 0], [1, 1], [-1, -1]].toString()
    );
  });
  it('find the max distance correctly', () => {
    var G = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    assert.equal(mcmc.maxDistance(G, 0), 3);
    G.removeEdge(3, 4);
    assert.equal(mcmc.maxDistance(G, 0), 3 + Math.sqrt(2));
  });
  it('find the number of edges connected to the source correctly', () => {
    var G = mcmc.createGraph(5, [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]);
    assert.equal(mcmc.edgeConnectedToSource(G, 0), 2);
    G.removeEdge(0, 4);
    assert.equal(mcmc.edgeConnectedToSource(G, 0), 1);
  });
  it('calculate the expected value correctly', () => {
    var targetList = [0, 1, 2, 3, 4];
    var weightList = [1, 2, 3, 4, 5];
    assert.equal(mcmc.expectedValue(targetList, weightList), 40 / 15);
  });
  it('run mcmc simulation successfully', () => {
    var input = mcmc.setDefault({});
    input.iterations = 100;
    assert(mcmc.markovChain(input));
  });
});
