'use strict';
const jsnx = require('jsnetworkx');

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
module.exports = {
  distance,
  createGraph,
  isConnected,
  isBridge,
  adjacencyMatrix,
  isAnEdge
};
