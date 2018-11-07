'use strict';
const jsnx = require('jsnetworkx');
const cla = require('command-line-args');

module.exports = {};

function distance(G, node1, node2) {
  /*
  This function calculates the direct distance between two nodes
  Args:
  node1: The first node
  node2: The second node
  Return:
  The direct distance between the two nodes
  */
  // get the coordinate of the first node
  var coordinate1 = G.node.get(node1).coordinate;
  // Get the coordinate of the second node
  var coordinate2 = G.node.get(node2).coordinate;
  // Separate x coordinates
  var x0 = coordinate1[0];
  var x1 = coordinate2[0];
  // Separate y coordinates
  var y0 = coordinate1[1];
  var y1 = coordinate2[1];
  var xdifference = x1 - x0;
  var ydifference = y1 - y0;
  // Calculate the dirct distance
  var distance = Math.sqrt(xdifference ** 2 + ydifference ** 2);
  return distance;
}
// eslint-disable-next-line no-unused-vars
function createGraph(numberOfNodes, coordinates) {
  /*
  This function takes two parameters and create a loop graph
  Args: 
  numberOfNodes: The number of nodes that will be present in the graph
  coordinates: The coordinate array of each of the nodes
  Return:

  A loop graph object in which the nodes are linked in increasing order and the first node is connected with the last node
  */
  var G = new jsnx.Graph();
  for (var i = 0; i < numberOfNodes; i++) {
    // Adding nodes to the graph
    G.addNode(i, { coordinate: coordinates[i] });
    // Connecting the nodes in increasing order
    if (i !== 0) {
      G.addWeightedEdgesFrom([[i, i - 1, distance(G, i, i - 1)]]);
    }
  }
  // Connecting the first node and the last node to make a loop
  G.addWeightedEdgesFrom([[0, numberOfNodes - 1, distance(G, 0, numberOfNodes - 1)]]);
  return G;
}

function isConnected(G) {
  /*
  This function takes a single parameter, G and determine if the graph is connected or not
  Args:
  G: the graph object
  Return:
  Boolean
  True if the graph is connected
  False if the graph is not connected
  */
  // Create an empty list of length of the nodes in the graph
  var visited = new Array(G.nodes().length);
  // Assign each of the array to be not visited
  for (var i = 0; i < visited.length; i++) {
    visited[i] = false;
  }
  // Create a queue with the first node in it
  var queue = [0];
  while (queue[0] !== undefined) {
    // Set the currentNode as the first node in the queue
    var currentNode = queue[0];
    // Mark this currentNode as visited
    visited[queue[0]] = true;
    for (var j = 0; j < G.edges().length; j++) {
      // Check if currentNode is connected to any other unvisited nodes
      if (currentNode === G.edges()[j][0] && visited[G.edges()[j][1]] === false) {
        // Push the unvisited nodes that are connected to the currentNode into the queue
        queue.push(G.edges()[j][1]);
      } else if (currentNode === G.edges()[j][1] && visited[G.edges()[j][0]] === false) {
        queue.push(G.edges()[j][0]);
      }
    }
    // Pull the currentNode from the queue
    queue.shift();
  }
  // Return true if all the nodes are visited
  if (visited.indexOf(false) === -1) {
    return true;
  }
  // Return false if any of the nodes is unvisited
  return false;
}

// eslint-disable-next-line no-unused-vars
function isBridge(G, node1, node2) {
  /*
  This function determines if the edge between the two input nodes is a bridge or not
  Args:
  G: the graph object
  node1: One node in the graph
  node2: The other node in the graph

  Return:
  True if the edge between the two input nodes is a bridge
  False if the edge between the two inout nodes is not a bridge
  */
  // Remove the edge between the two nodes
  G.removeEdge(node1, node2);
  // If after removal of the edge, the graph is no more connected
  if (!isConnected(G)) {
    // First add the removed edge back
    G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
    // Then return that the edge between these two nodes is the bridge
    return true;
  }
  // If after removal of the edge, the graph is still connected
  // First add the removed edge back
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
  // The return that the edge between these two nodes is not the bridge
  return false;
}

function adjacencyMatrix(G) {
  /*
  This function creates an adjacencyMatrix based on the edges in a graph

  Args:
  G: graph object

  Return:
  n by n AdjacencyMatrix of the graph
  */
  // Initiate an empty adjacencyMatrix
  var adjacencyMatrix = [];
  // Assign 0 to all elements in the adjacencyMatrix
  for (var i = 0; i < G.nodes().length; i++) {
    adjacencyMatrix.push(new Array(G.nodes().length).fill(0));
  }
  for (var j = 0; j < G.edges().length; j++) {
    // Assgin weight to the edge that connects the two nodes
    adjacencyMatrix[G.edges()[j][0]][G.edges()[j][1]] = G.adj
      .get(G.edges()[j][0])
      .get(G.edges()[j][1]).weight;
    adjacencyMatrix[G.edges()[j][1]][G.edges()[j][0]] = G.adj
      .get(G.edges()[j][0])
      .get(G.edges()[j][1]).weight;
  }
  return adjacencyMatrix;
}
// eslint-disable-next-line no-unused-vars
function isAnEdge(G, node1, node2) {
  /*
  This function takes a graph and two nodes in the graph and figures out if there is an edge connecting the two nodes
  Args:
  G: graph object
  node1: node
  node2: node
  */
  var matrix = adjacencyMatrix(G);
  // Check the adjacency matrix to see if the cooresponding value is nonzero or not
  if (matrix[node1][node2] !== 0) {
    return true;
  }
  return false;
}

function theta(G, r, source) {
  var overAllSum = 0;
  for (var i = 0; i < G.edges().length; i++) {
    overAllSum += G.adj.get(G.edges()[i][0]).get(G.edges()[i][1]).weight;
  }
  var sourceSum = 0;
  for (var j = 0; j < G.nodes().length; j++) {
    sourceSum += jsnx.dijkstraPathLength(G, {
      source: source,
      target: j
    });
  }
  var theta = r * overAllSum + sourceSum;
  return theta;
}

function pijOverpii(Gj, Gi, T, r, source) {
  var thetai = theta(Gi, r, source);
  var thetaj = theta(Gj, r, source);
  var PijOverPii = Math.exp((thetai - thetaj) / T);
  return PijOverPii;
}

function findBridges(G) {
  var B = 0;
  for (var i = 0; i < G.edges().length; i++) {
    if (isBridge(G, G.edges()[i][0], G.edges()[i][1])) {
      B++;
    }
  }
  return B;
}

function addOrRemove(G) {
  var existingEdges = G.edges().length;
  var bridges = findBridges(G);
  var numberOfNodes = G.nodes().length;
  var numberOfEdgesInaCompleteGraph = (numberOfNodes * (numberOfNodes - 1)) / 2;
  var availableAddition = numberOfEdgesInaCompleteGraph - existingEdges;
  var removal = existingEdges - bridges;
  var addition = availableAddition;
  var probability = Math.random();
  // Console.log(probability);
  // console.log(addition / (addition + removal));
  if (probability < addition / (addition + removal)) {
    return true;
  }
  return false;
}

function addRandomEdge(G) {
  /* This function adds a random edge to the graph.
  Args:
  The graph object
  Return:
  The new graph with randomly added edge. 
  */
  var node1 = Math.floor((G.nodes().length - 0.00000001) * Math.random());
  var node2 = Math.floor((G.nodes().length - 0.00000001) * Math.random());
  while (node1 === node2 || isAnEdge(G, node1, node2)) {
    node1 = Math.floor((G.nodes().length - 0.00000001) * Math.random());
    node2 = Math.floor((G.nodes().length - 0.00000001) * Math.random());
  }
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
  return G;
}

function removeRandomEdge(G) {
  /* This function removes a random edge.
  Args:
  The graph object
  Return:
  The new graph with a random not bridge edge removed.
  */
  let availbility = [];
  for (let i = 0; i < G.edges().length; i++) {
    if (!isBridge(G, G.edges()[i][0], G.edges()[i][1])) {
      availbility.push(G.edges()[i]);
    }
  }
  var randomIndex = Math.floor(Math.random() * (availbility.length - 0.00000001));
  var edgeRemoved = availbility[randomIndex];
  G.removeEdge(edgeRemoved[0], edgeRemoved[1]);
  return G;
}

function proposalDistribution(Gj, Gi) {
  var E = Gi.edges().length;
  var B = findBridges(Gi);
  var M = Gi.nodes().length;
  if (Gj.edges().length > Gi.edges().length) {
    return 1 / ((M * (M - 1)) / 2 - E);
  }
  if (Gj.edges().length < Gi.edges().length) {
    return 1 / (E - B);
  }
}

function acceptance(Gj, Gi, T, r, source) {
  var pi = pijOverpii(Gj, Gi, T, r, source);
  var pji = proposalDistribution(Gj, Gi);
  var pij = proposalDistribution(Gi, Gj);
  var P = Math.min(1, (pi * pij) / pji);
  return P;
}

function setDefault(userInput) {
  /*
  This function gives default values for markov chain parameters, if any of them were not provided by the user.
  Args:
  userInput

  Return:
  Modified userInput if any of the parameters is not give
  */

  // Setup the default value
  if (userInput.number === undefined) {
    userInput.number = 5;
  }
  if (userInput.coordinates === undefined) {
    userInput.coordinates = '0,0,1,0,-1,0,0,1,0,-1';
  }
  if (userInput.r === undefined) {
    userInput.r = 1;
  }
  if (userInput.T === undefined) {
    userInput.T = 100;
  }
  if (userInput.sourceNode === undefined) {
    userInput.sourceNode = 0;
  }
  if (userInput.iterations === undefined) {
    userInput.iterations = 1000;
  }
  return userInput;
}
function edgeConnectedToSource(G, sourceNode) {
  /*
  This function calculates the number of edges connected to the source node.
  Args:
  the graph object
  source node

  Return:
  number of edges that are connected to the source node
  */
  var e = 0;
  for (let i = 0; i < G.edges().length; i++) {
    if (G.edges()[i][0] === sourceNode || G.edges()[i][1] === sourceNode) {
      e++;
    }
  }
  return e;
}

function maxDistance(G, sourceNode) {
  /*
  This function find the maximum distance from the source node in a graph.
  Args:
  the graph object
  the source node
  Return:
  the maximum distance
  */
  let max = 0;
  for (let i = 0; i < G.nodes().length; i++) {
    if (jsnx.dijkstraPathLength(G, { source: sourceNode, target: i }) > max) {
      max = jsnx.dijkstraPathLength(G, { source: sourceNode, target: i });
    }
  }
  return max;
}

function cloneGraph(G) {
  /* This function creates an identical clone of the graph
  Args:
  G: a graph object 
  coordinates: an array with coordinations of nodes
  Return:
  an identical clone of the original graph object
  */
  var clone = new jsnx.Graph();
  for (var i = 0; i < G.nodes().length; i++) {
    clone.addNode(i, { coordinate: G.node.get(i).coordinate });
  }
  for (var j = 0; j < G.edges().length; j++) {
    clone.addWeightedEdgesFrom([
      [G.edges()[j][0], G.edges()[j][1], distance(G, G.edges()[j][0], G.edges()[j][1])]
    ]);
  }
  return clone;
}

function expectedValue(array) {
  /* This function calculates the expected value.
     input: an array 
     output: expected number */
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += array[i];
  }
  var expectedValue = sum / array.length;
  return expectedValue;
}

function markovChain(userInput) {
  var modifiedInput = setDefault(userInput);
  var numberOfNodes = modifiedInput.number;
  var coordinates = JSON.parse('[' + modifiedInput.coordinates + ']');
  var runtime = modifiedInput.iterations;
  var r = modifiedInput.r;
  var T = modifiedInput.T;
  var sourceNode = modifiedInput.sourceNode;
  var coordinatesArray = new Array(numberOfNodes);
  for (var i = 0; i < numberOfNodes; i++) {
    coordinatesArray[i] = [coordinates[i * 2], coordinates[i * 2 + 1]];
  }
  var Gi = createGraph(numberOfNodes, coordinatesArray);
  var Gj;
  var Gtemp;
  var numberOfEdges = [];
  var numberOfEdgesToSource = [];
  var maximumDistance = [];
  for (var j = 0; j < runtime; j++) {
    var AoR = addOrRemove(Gi);
    console.log(j);
    if (AoR) {
      Gtemp = cloneGraph(Gi);
      Gj = addRandomEdge(Gi);
      Gi = cloneGraph(Gtemp);
    } else {
      Gtemp = cloneGraph(Gi);
      Gj = removeRandomEdge(Gi);
      Gi = cloneGraph(Gtemp);
    }
    var randomGeneratedProbability = Math.random();
    var accept = acceptance(Gj, Gi, T, r, sourceNode);
    // console.log(Gi.edges());
    // console.log(Gj.edges());
    // console.log(accept);
    if (accept > randomGeneratedProbability) {
      Gi = cloneGraph(Gj);
      numberOfEdges.push(Gi.edges().length);
      numberOfEdgesToSource.push(edgeConnectedToSource(Gi, sourceNode));
      maximumDistance.push(maxDistance(Gi, sourceNode));
    }
  }
  // console.log(Gi.edges());
  // console.log(Gj.edges());
  console.log(
    `The expected number of edges in the graph is ${expectedValue(numberOfEdges)}.`
  );
  console.log(
    `The expected number of edges connected to source node is ${expectedValue(
      numberOfEdgesToSource
    )}.`
  );
  console.log(
    `The expected maximum distance of shortest path that connects to source node is ${expectedValue(
      numberOfEdges
    )}.`
  );
}
if (require.main === module) {
  /* 
  This function collects input from user through command line.
  The input includes the number of nodes, the coordinates of the nodes, r and t. 
  Collecting args:
  number
  coordinates
  r
  t
  iterations
  sourceNode
  */
  const userInputOptions = [
    { name: 'number', type: Number },
    { name: 'coordinates', type: Array },
    { name: 'r', type: Number },
    { name: 'T', type: Number },
    { name: 'iterations', type: Number },
    { name: 'sourNode', type: Number }
  ];
  const userInput = cla(userInputOptions);
  markovChain(userInput);
}

module.exports = {
  distance,
  createGraph,
  isConnected,
  isBridge,
  adjacencyMatrix,
  isAnEdge,
  theta,
  pijOverpii,
  findBridges,
  addOrRemove,
  addRandomEdge,
  removeRandomEdge,
  proposalDistribution,
  acceptance,
  setDefault,
  maxDistance,
  edgeConnectedToSource,
  cloneGraph,
  expectedValue
  // Functions that need tests
};
