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
});
