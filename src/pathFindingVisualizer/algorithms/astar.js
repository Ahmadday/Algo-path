export function astar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.totalDistance = manhattanDistance(startNode, finishNode);

  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length) {
    unvisitedNodes.sort((a, b) => a.totalDistance - b.totalDistance);
    const closestNode = unvisitedNodes.shift();

    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    updateUnvisitedNeighbors(closestNode, finishNode, grid);
  }
  return visitedNodesInOrder;
}

function updateUnvisitedNeighbors(node, finishNode, grid) {
  const neighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of neighbors) {
    if (neighbor.isWall) continue;

    const tentativeDistance = node.distance + neighbor.weight;
    if (tentativeDistance < neighbor.distance) {
      neighbor.distance = tentativeDistance;
      neighbor.totalDistance = tentativeDistance + manhattanDistance(neighbor, finishNode);
      neighbor.previousNode = node;
    }
  }
}

function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter((n) => !n.isVisited);
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) for (const node of row) nodes.push(node);
  return nodes;
}