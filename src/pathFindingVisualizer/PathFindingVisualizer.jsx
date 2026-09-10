import { useState, useEffect, useRef } from 'react';
import Node from './Node/Node';
import { bfs } from './algorithms/bfs';
import { dfs } from './algorithms/dfs';
import { astar } from './algorithms/astar';
import { dijkstra, getNodesInShortestPathOrder } from './algorithms/dijkstra';
import './pathFindingVisualizer.css';

const INITIAL_START = { row: 10, col: 15 };
const INITIAL_FINISH = { row: 10, col: 35 };

const getGridDimensions = () => {
  const isMobile = window.innerWidth <= 480;
  const nodeSize = 22;

  const widthMultiplier = isMobile ? 1.3 : 1;
  const heightMultiplier = isMobile ? 2 : 1;

  const maxWidth = (window.innerWidth - 24) * widthMultiplier;
  const maxHeight = window.innerHeight * 0.6 * heightMultiplier;

  let cols = Math.floor(maxWidth / nodeSize);
  let rows = Math.floor(maxHeight / nodeSize);

  cols = Math.max(10, Math.min(cols, isMobile ? 62 : 50));
  rows = Math.max(8, Math.min(rows, isMobile ? 40 : 20));

  return { rows, cols };
};

function PathFindingVisualizer() {
  const [dimensions, setDimensions] = useState(getGridDimensions());
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [movingStart, setMovingStart] = useState(false);
  const [movingFinish, setMovingFinish] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [placingWeights, setPlacingWeights] = useState(false);
  const [startNodePos, setStartNodePos] = useState({
    row: Math.floor(dimensions.rows / 2),
    col: Math.floor(dimensions.cols / 4),
  });
  const [finishNodePos, setFinishNodePos] = useState({
    row: Math.floor(dimensions.rows / 2),
    col: Math.floor((dimensions.cols / 4) * 3),
  });
  const timeoutIds = useRef([]);

  useEffect(() => {
    setGrid(getInitialGrid(dimensions.rows, dimensions.cols, startNodePos, finishNodePos));
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setMouseIsPressed(false);
      setMovingStart(false);
      setMovingFinish(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        setPlacingWeights(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        setPlacingWeights(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newDims = getGridDimensions();
      setDimensions(newDims);

      const newStart = {
        row: Math.floor(newDims.rows / 2),
        col: Math.floor(newDims.cols / 4),
      };
      const newFinish = {
        row: Math.floor(newDims.rows / 2),
        col: Math.floor((newDims.cols / 4) * 3),
      };

      setStartNodePos(newStart);
      setFinishNodePos(newFinish);
      setGrid(getInitialGrid(newDims.rows, newDims.cols, newStart, newFinish));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (row, col) => {
    if (isRunning) return;

    const node = grid[row][col];
    if (!node) return;

    if (node.isStart) {
      setMovingStart(true);
      return;
    }
    if (node.isFinish) {
      setMovingFinish(true);
      return;
    }

    const newGrid = getNewGridWithCellToggled(grid, row, col, placingWeights);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const runAlgorithm = (algorithm) => {
    if (isRunning) return;

    setIsRunning(true);
    resetNodesForAlgorithm();

    const startNode = grid[startNodePos.row][startNodePos.col];
    const finishNode = grid[finishNodePos.row][finishNodePos.col];
    const visitedNodesInOrder = algorithm(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

    animateVisitedNodes(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const handleMouseEnter = (row, col) => {
    if (isRunning) return;
    if (movingStart) {
      moveStartNode(row, col);
      return;
    }
    if (movingFinish) {
      moveFinishNode(row, col);
      return;
    }
    if (!mouseIsPressed) return;

    const newGrid = getNewGridWithCellToggled(grid, row, col, placingWeights);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setMouseIsPressed(false);
    setMovingStart(false);
    setMovingFinish(false);
  };

  const handleTouchMove = (e) => {
    if (isRunning) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.id.startsWith('node-')) {
      const [, row, col] = element.id.split('-');
      handleMouseEnter(Number(row), Number(col));
    }
  };

  const moveStartNode = (row, col) => {
    const target = grid[row]?.[col];
    if (!target || target.isWall || target.isWeight || target.isFinish) return;

    const newGrid = cloneGrid(grid).map((r) => r.map((n) => ({ ...n, isStart: false })));
    newGrid[row][col] = { ...newGrid[row][col], isStart: true };
    setGrid(newGrid);
    setStartNodePos({ row, col });
  };

  const moveFinishNode = (row, col) => {
    const target = grid[row]?.[col];
    if (!target || target.isWall || target.isWeight || target.isStart) return;

    const newGrid = cloneGrid(grid).map((r) => r.map((n) => ({ ...n, isFinish: false })));
    newGrid[row][col] = { ...newGrid[row][col], isFinish: true };
    setGrid(newGrid);
    setFinishNodePos({ row, col });
  };

  const getAnimatedNodeClassName = (node, phase) => {
    if (node.isStart) return 'node node-start';
    if (node.isFinish) return 'node node-finish';
    if (node.isWall) return 'node node-wall';

    if (phase === 'visited') {
      return node.isWeight ? 'node node-weight node-visited-weight' : 'node node-visited';
    }

    if (phase === 'path') {
      return node.isWeight ? 'node node-weight node-shortest-path-weight' : 'node node-shortest-path';
    }

    return getNodeClassName(node);
  };

  const animateVisitedNodes = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        const id = setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        timeoutIds.current.push(id);
        return;
      }

      const id = setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement) {
          nodeElement.className = getAnimatedNodeClassName(node, 'visited');
        }
      }, 10 * i);

      timeoutIds.current.push(id);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder) => {
    if (!nodesInShortestPathOrder || nodesInShortestPathOrder.length === 0) {
      setIsRunning(false);
      return;
    }

    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const id = setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement) {
          nodeElement.className = getAnimatedNodeClassName(node, 'path');
        }

        if (i === nodesInShortestPathOrder.length - 1) {
          setIsRunning(false);
        }
      }, 50 * i);

      timeoutIds.current.push(id);
    }
  };

  const resetNodesForAlgorithm = () => {
    timeoutIds.current.forEach((id) => clearTimeout(id));
    timeoutIds.current = [];

    for (const row of grid) {
      for (const node of row) {
        node.isVisited = false;
        node.distance = Infinity;
        node.totalDistance = Infinity;
        node.previousNode = null;

        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeElement && !node.isWall) {
          nodeElement.className = getNodeClassName(node);
        }
      }
    }
  };

  const visualizeDijkstra = () => runAlgorithm(dijkstra);
  const visualizeBFS = () => runAlgorithm(bfs);
  const visualizeDFS = () => runAlgorithm(dfs);
  const visualizeAStar = () => runAlgorithm(astar);

  const clearBoard = () => {
    timeoutIds.current.forEach((id) => clearTimeout(id));
    timeoutIds.current = [];
    setIsRunning(false);
    setMouseIsPressed(false);
    setMovingStart(false);
    setMovingFinish(false);
    setPlacingWeights(false);

    const newGrid = getInitialGrid(dimensions.rows, dimensions.cols, startNodePos, finishNodePos);
    setGrid(newGrid);

    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[0].length; col++) {
        const node = newGrid[row][col];
        const extraClassName = node.isFinish ? 'node-finish' : node.isStart ? 'node-start' : node.isWeight ? 'node-weight' : '';
        const nodeElement = document.getElementById(`node-${row}-${col}`);
        if (nodeElement) {
          nodeElement.className = getNodeClassName(node);
        }
      }
    }
  };

  const generateRandomMaze = () => {
    if (isRunning) return;
    setPlacingWeights(false);
    const newGrid = getInitialGrid(dimensions.rows, dimensions.cols, startNodePos, finishNodePos);
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[0].length; col++) {
        const node = newGrid[row][col];
        if (node.isStart || node.isFinish) continue;

        const randomValue = Math.random();
        if (randomValue < 0.2) {
          node.isWall = true;
          node.isWeight = false;
          node.weight = 1;
        } else if (randomValue < 0.38) {
          node.isWall = false;
          node.isWeight = true;
          node.weight = 5;
        }
      }
    }
    setGrid(newGrid);
  };

  return (
    <div className="visualizer">
      <h1 className="app-title">Pathfinding Visualizer</h1>
      <div className="controls">
        <button onClick={visualizeDijkstra} disabled={isRunning}>
          {isRunning ? 'Running...' : "Visualize Dijkstra's Algorithm"}
        </button>
        <button onClick={visualizeBFS} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Visualize BFS'}
        </button>
        <button onClick={visualizeDFS} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Visualize DFS'}
        </button>
        <button onClick={visualizeAStar} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Visualize A*'}
        </button>
        <button
          className="weight-btn"
          onClick={() => setPlacingWeights((prev) => !prev)}
          disabled={isRunning}
          type="button"
        >
          {placingWeights ? 'Weight Mode On' : 'Place Weights'}
        </button>
        <button className="clear-btn" onClick={clearBoard}>Clear Board</button>
        <button className="maze-btn" onClick={generateRandomMaze} disabled={isRunning}>Generate Random Maze</button>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="legend-swatch legend-start"></span>Start</div>
        <div className="legend-item"><span className="legend-swatch legend-finish"></span>Finish</div>
        <div className="legend-item"><span className="legend-swatch legend-wall"></span>Wall</div>
        <div className="legend-item"><span className="legend-swatch legend-weight"></span>Weighted</div>
        <div className="legend-item"><span className="legend-swatch legend-visited"></span>Visited</div>
        <div className="legend-item"><span className="legend-swatch legend-path"></span>Shortest Path</div>
      </div>

      <div className="grid-container">
        <div className="grid" onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid-row">
              {row.map((node, nodeIdx) => {
                const { row: nodeRow, col: nodeCol, isFinish, isStart, isWall, isWeight } = node;

                return (
                  <Node
                    key={`${nodeRow}-${nodeCol}`}
                    row={nodeRow}
                    col={nodeCol}
                    isStart={isStart}
                    isFinish={isFinish}
                    isWall={isWall}
                    isWeight={isWeight}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    onMouseUp={handleMouseUp}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="app-footer">Created by Ahmad Day.</footer>
    </div>
  );
}

const cloneGrid = (grid) => grid.map((row) => row.map((node) => ({ ...node })));

const getNodeClassName = (node) => {
  if (node.isWall) return 'node node-wall';
  if (node.isFinish) return 'node node-finish';
  if (node.isStart) return 'node node-start';
  if (node.isWeight) return 'node node-weight';
  return 'node';
};

const getInitialGrid = (rows, cols, startPos, finishPos) => {
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(col, row, startPos, finishPos));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startPos, finishPos) => {
  return {
    col,
    row,
    isStart: row === startPos.row && col === startPos.col,
    isFinish: row === finishPos.row && col === finishPos.col,
    distance: Infinity,
    totalDistance: Infinity,
    isVisited: false,
    isWall: false,
    isWeight: false,
    weight: 1,
    previousNode: null,
  };
};

const getNewGridWithCellToggled = (grid, row, col, placingWeights) => {
  const newGrid = cloneGrid(grid);
  const node = newGrid[row][col];
  if (!node || node.isStart || node.isFinish) return grid;

  if (placingWeights) {
    newGrid[row][col] = {
      ...node,
      isWall: false,
      isWeight: !node.isWeight,
      weight: node.isWeight ? 1 : 5,
    };
    return newGrid;
  }

  newGrid[row][col] = {
    ...node,
    isWall: !node.isWall,
    isWeight: false,
    weight: 1,
  };

  return newGrid;
};

export default PathFindingVisualizer;