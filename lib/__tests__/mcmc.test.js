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
  it('Check the connectivity', () => {
    var G = new jsnx.Graph();
    G.addNodesFrom([0, 1, 2, 3]);
    G.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1], [0, 3, 1], [0, 2, 1]]);
    assert.equal(mcmc.isConnected(G), true);
    var G2 = new jsnx.Graph();
    G2.addNodesFrom([0, 1, 2, 3]);
    G2.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1]]);
    assert.equal(mcmc.isConnected(G2), false);
  });
});
