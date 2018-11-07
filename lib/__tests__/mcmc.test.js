const assert = require('assert');
const mcmc = require('../index.js');
const jsnx = require('jsnetworkx');

describe('mcmc', () => {
  it('find a distance', () => {
    var G = new jsnx.Graph();
    G.addNode(0, { coordinate: [0, 0] });
    G.addNode(1, { coordinate: [3, 4] });
    var distance = mcmc.distance(G, 1, 0);
    assert.equal(5, distance);
  });
  it('create a graph', () => {
    var G = mcmc.createGraph(3, [[0, 0], [1, 1], [2, 2]]);
    assert.equal(G.nodes().length, 3);
    assert.equal(G.edges().length, 3);
  });
  it('check the connectivity', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3]);
    G.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 2, 1]]);
    assert.equal(mcmc.isConnected(G), true);
    var G2 = new jsnx.Graph();
    G2.addNodesFrom([0, 1, 2, 3]);
    G2.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1]]);
    assert.equal(mcmc.isConnected(G2), false);
    var G3 = new jsnx.Graph();
    G3.addNodesFrom([0, 1, 2, 3], {
      coordinate: [[0, 0], [0, 1], [1, 0], [[0, -1], [1, 2]]]
    });
    G3.addWeightedEdgesFrom([[1, 2, 1], [0, 3, 1], [0, 2, 1]]);
    assert(mcmc.isConnected(G3));
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
  it('has an edge between the two nodes', () => {
    var G = mcmc.createGraph(5, [[0, 0], [1, 2], [2, 8], [8, 10], [9, 20]]);
    assert(mcmc.isAnEdge(G, 0, 1));
    assert(mcmc.isAnEdge(G, 2, 1));
    assert(!mcmc.isAnEdge(G, 1, 3));
    assert(!mcmc.isAnEdge(G, 2, 4));
    assert(!mcmc.isAnEdge(G, 1, 4));
  });
  it('calculates theta correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    var thetai = mcmc.theta(Gi, 10, 0);
    assert.equal(thetai, 44);
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gj.addWeightedEdgesFrom([[0, 2, Math.sqrt(2)]]);
    var thetaj = mcmc.theta(Gj, 10, 0);
    assert.equal(thetaj, 42 + 11 * Math.sqrt(2));
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
  it('correctly find the number of bridges', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    assert.equal(mcmc.findBridges(Gi), 0);
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gj.removeEdge(0, 1);
    assert.equal(mcmc.findBridges(Gj), 3);
  });
  it('add or remove edge correctly', () => {
    var Gi = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gi.removeEdge(0, 3);
    for (var i = 0; i < 10; i++) {
      assert(mcmc.addOrRemove(Gi));
    }
    var Gj = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    Gj.addWeightedEdgesFrom([
      [0, 2, mcmc.distance(Gj, 0, 2)],
      [1, 3, mcmc.distance(Gj, 1, 3)]
    ]);
    for (var j = 0; j < 10; j++) {
      assert(!mcmc.addOrRemove(Gj));
    }
  });
  it('add a random edge correctly', () => {
    var G = mcmc.createGraph(4, [[0, 0], [1, 0], [1, 1], [0, 1]]);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 5);
    mcmc.addRandomEdge(G);
    assert.equal(G.edges().length, 6);
    assert(mcmc.isAnEdge(G, 1, 3));
    assert(mcmc.isAnEdge(G, 0, 2));
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
  
});
