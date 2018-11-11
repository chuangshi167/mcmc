'use strict';
const jsnx = require('jsnetworkx');
const cla = require('command-line-args');

function distance(G, node1, node2) {
  /*
  This function calculates the direct distance between two nodes
  Args:
  G: graph
  node1: node
  node2: node

  Return:
  The distance between the two nodes: number
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

function dfs(G) {
  /*
  This function takes a single parameter, G and determine if the graph is connected or not
  Args:
  G: the graph object
  Return:
  Visited nodes: Array
  */
  var queue = [0];
  var visited = [];
  while (queue[0] !== undefined) {
    var currentNode = queue[0];
    queue.shift();
    visited.push(currentNode);
    var neighbor = G.neighbors(currentNode);
    for (var j = 0; j < neighbor.length; j++) {
      if (!visited.includes(neighbor[j]) && !queue.includes(neighbor[j])) {
        queue.push(neighbor[j]);
      }
    }
  }
  return visited;
}

function isConnected(G) {
  var visited = dfs(G);
  visited.sort();
  if (visited.toString() !== G.nodes().toString()) {
    return false;
  }
  return true;
}

function adjacencyMatrix(G) {
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

function isEqual(Gi, Gj) {
  var equal = true;
  var matrix1 = adjacencyMatrix(Gi);
  var matrix2 = adjacencyMatrix(Gj);
  if (Gi.edges().length !== Gj.edges().length) {
    equal = false;
  }
  for (var i = 0; i < matrix1.length; i++) {
    for (var j = 0; j < 2; j++) {
      equal = equal && matrix1[i][j] === matrix2[i][j];
    }
  }
  return equal;
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

function isBridge(G, node1, node2) {
  var Gcopy = cloneGraph(G);
  Gcopy.removeEdge(node1, node2);
  if (!isConnected(Gcopy)) {
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

function addRandomEdge(G) {
  var node1 = Math.floor(G.nodes().length * Math.random());
  var node2 = Math.floor(G.nodes().length * Math.random());
  while (node1 === node2 || G.neighbors(node1).includes(node2)) {
    node1 = Math.floor(G.nodes().length * Math.random());
    node2 = Math.floor(G.nodes().length * Math.random());
  }
  G.addWeightedEdgesFrom([[node1, node2, distance(G, node1, node2)]]);
  return G;
}

function removeRandomEdge(G) {
  var randomIndex = Math.floor(Math.random() * G.edges().length);
  while (isBridge(G, G.edges()[randomIndex][0], G.edges()[randomIndex][1])) {
    randomIndex = Math.floor(Math.random() * G.edges().length);
  }
  G.removeEdge(G.edges()[randomIndex][0], G.edges()[randomIndex][1]);
}

function proposalDistribution(Gj, Gi) {
  var E = Gi.edges().length;
  var M = Gi.nodes().length;
  var B = 0;
  for (var i = 0; i < Gi.edges().length; i++) {
    if (isBridge(Gi, Gi.edges()[i][0], Gi.edges()[i][1])) {
      B++;
    }
  }
  if (Gj.edges().length > Gi.edges().length) {
    return 1 / ((M * (M - 1)) / 2 - E);
  }
  if (Gj.edges().length < Gi.edges().length) {
    return 1 / (E - B);
  }
}

function acceptOrReject(Gj, Gi, T, r, source) {
  var pi = pijOverpii(Gj, Gi, T, r, source);
  var pji = proposalDistribution(Gj, Gi);
  var pij = proposalDistribution(Gi, Gj);
  var P = Math.min(1, (pi * pij) / pji);
  var randomProbability = Math.random();
  if (P > randomProbability) {
    return true;
  }
  return false;
}

function addOrRemove(G) {
  var E = G.edges().length;
  var B = 0;
  for (var i = 0; i < G.edges().length; i++) {
    if (isBridge(G, G.edges()[i][0], G.edges()[i][1])) {
      B++;
    }
  }
  var M = G.nodes().length;
  var Mterm = 0.5 * M * (M - 1);
  var randomNumber = Math.random();
  if (E === B) {
    return true;
  }
  if (Mterm === E) {
    return false;
  }
  if (randomNumber < 0.5) {
    return true;
  }
  return false;
}

function logHistory(G, history) {
  var flag = true;
  history.forEach((value, key, map) => {
    if (isEqual(key, G)) {
      map.set(key, ++value);
      flag = false;
    }
  });
  if (flag) {
    console.log('add new Graph');
    // console.log(G.edges());
    history.set(G, 1);
  }
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
    userInput.T = 0.1;
  }
  if (userInput.sourceNode === undefined) {
    userInput.sourceNode = 0;
  }
  if (userInput.iterations === undefined) {
    userInput.iterations = 1000;
  }
  return userInput;
}

function convert(coordinates) {
  var coordinateArr = JSON.parse('[' + coordinates + ']');
  var coor = [];
  for (let i = 0; i < coordinateArr.length / 2; i++) {
    coor.push([coordinateArr[2 * i], coordinateArr[2 * i + 1]]);
  }
  return coor;
}

function maxDistance(G, sourceNode) {
  let max = 0;
  for (let i = 0; i < G.nodes().length; i++) {
    if (jsnx.dijkstraPathLength(G, { source: sourceNode, target: i }) > max) {
      max = jsnx.dijkstraPathLength(G, { source: sourceNode, target: i });
    }
  }
  return max;
}

function edgeConnectedToSource(G, sourceNode) {
  var e = 0;
  for (let i = 0; i < G.edges().length; i++) {
    if (G.edges()[i][0] === sourceNode || G.edges()[i][1] === sourceNode) {
      e++;
    }
  }
  return e;
}

function expectedValue(targetList, weightList) {
  var sumN = 0;
  var sumTarget = 0;
  for (var i = 0; i < targetList.length; i++) {
    sumN += weightList[i];
    sumTarget += weightList[i] * targetList[i];
  }
  var expectedValue = sumTarget / sumN;
  return expectedValue;
}

function markovChain(input) {
  var numberOfNodes = input.number;
  var coordinates = input.coordinates;
  var T = input.T;
  var r = input.r;
  var source = input.sourceNode;
  coordinates = convert(coordinates);
  var Gi = createGraph(numberOfNodes, coordinates);
  var iterations = input.iterations;
  var history = new Map();
  history.set(Gi, 1);
  for (var i = 0; i < iterations; i++) {
    var Gj = cloneGraph(Gi);
    var aOr = addOrRemove(Gj);
    if (aOr) {
      addRandomEdge(Gj);
    } else if (!aOr) {
      removeRandomEdge(Gj);
    }
    var success = acceptOrReject(Gj, Gi, T, r, source);
    if (success) {
      Gi = cloneGraph(Gj);
    }

    logHistory(Gi, history);
  }
  return history;
}

function main(input) {
  var history = markovChain(input);
  var historyArray = [];
  var historyGraph = [];
  var iterator = history[Symbol.iterator]();
  for (let item of iterator) {
    historyArray.push(item);
  }
  var edgeConnectedToSourceList = [];
  var totalEdgeList = [];
  var maxDistanceList = [];
  var graphDistributionList = [];
  for (var i = 0; i < historyArray.length; i++) {
    var G = historyArray[i][0];
    var n = historyArray[i][1];
    graphDistributionList.push(n);
    historyGraph.push(G.edges());
    totalEdgeList.push(G.edges().length);
    maxDistanceList.push(maxDistance(G, 0));
    edgeConnectedToSourceList.push(edgeConnectedToSource(G, 0));
  }
  console.log(
    `The expected number of edges in the graph is ${expectedValue(
      totalEdgeList,
      graphDistributionList
    )}.`
  );
  console.log(
    `The expected number of edges connected to source node is ${expectedValue(
      edgeConnectedToSourceList,
      graphDistributionList
    )}.`
  );
  console.log(
    `The expected maximum distance of shortest path that connects to source node is ${expectedValue(
      maxDistanceList,
      graphDistributionList
    )}.`
  );
}

if (require.main === module) {
  const userInputOptions = [
    { name: 'number', type: Number },
    { name: 'coordinates', type: Array },
    { name: 'r', type: Number },
    { name: 'T', type: Number },
    { name: 'iterations', type: Number },
    { name: 'sourceNode', type: Number }
  ];
  const userInput = cla(userInputOptions);
  var modifiedInput = setDefault(userInput);
  main(modifiedInput);
}

module.exports = {
  setDefault,
  distance,
  createGraph,
  dfs,
  isConnected,
  isEqual,
  cloneGraph,
  isBridge,
  theta,
  pijOverpii,
  addRandomEdge,
  removeRandomEdge,
  proposalDistribution,
  acceptOrReject,
  addOrRemove,
  adjacencyMatrix
};
