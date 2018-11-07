const assert = require('assert');
const mcmc = require('../index.js');
const jsnx = require('jsnetworkx');

describe('mcmc', () => {
  it('has a test', () => {
    assert(false, 'mcmc should have a test');
  });
  it('Find a distance?', () => {
    var G = new jsnx.Graph();
    G.addNode(0, { coordinate: [0, 0] });
    G.addNode(1, { coordinate: [3, 4] });
    var distance = mcmc.distance(G, 1, 0);
    assert.equal(5, distance);
  });
});
