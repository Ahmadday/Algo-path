# Pathfinding Visualizer

An interactive React app for visualizing pathfinding algorithms in action. Draw walls and weighted tiles, drag the start and finish nodes anywhere on the grid, and watch each algorithm explore the board to find a path.

## Live Demo

Add your deployment link here.

## Features

- Four algorithms: Dijkstra's Algorithm, Breadth-First Search (BFS), Depth-First Search (DFS), and A* Search
- Interactive grid: click and drag to draw and erase walls
- Draggable start and finish nodes: reposition them anywhere on the board
- Weighted terrain: certain cells cost more to move through
- Random maze generation: instantly fill the board with walls and weights
- Clear board: reset the grid and cancel any in-progress animation
- Mobile and touch support: responsive layout for phones and tablets

## How It Works

1. Pick an algorithm from the controls.
2. Click and drag on the grid to draw walls and weighted tiles.
3. Drag the green start node or red finish node to reposition them.
4. Press the visualize button to watch the algorithm explore the board.
5. Review the shortest path once the search completes.
6. Use Clear Board or Generate Random Maze to reset or randomize the layout.

## Algorithms Used

- Dijkstra's Algorithm — guarantees the shortest path by exploring nodes in order of their distance from the start.
- BFS (Breadth-First Search) — guarantees the shortest path on an unweighted grid by exploring layer by layer.
- DFS (Depth-First Search) — finds a path, but not necessarily the shortest one.
- A* Search — finds the shortest path efficiently using a Manhattan-distance heuristic to prioritize promising moves.

## Tech Stack

- React
- Vite
- Plain CSS
- No external UI or state-management libraries

## Project Structure

```text
src/
├── App.jsx
├── main.jsx
├── index.css
├── App.css
├── pathFindingVisualizer/
│   ├── PathFindingVisualizer.jsx
│   ├── pathFindingVisualizer.css
│   ├── Node/
│   │   ├── Node.jsx
│   │   └── Node.css
│   └── algorithms/
│       ├── astar.js
│       ├── bfs.js
│       ├── dfs.js
│       └── dijkstra.js
└── assets/
```

## Running Locally

```bash
npm install
npm run dev
```

Then open the app in a browser, usually at http://localhost:5173.

## Known Limitations

- Random maze generation does not guarantee a solvable path.
- Resizing the window or rotating a mobile device regenerates the grid and clears custom walls.

## Possible Future Additions

- Recursive-division maze generation
- Dark mode
- Adjustable animation speed
- More algorithms
- Additional pages for other visualizer types, such as sorting algorithms

## Author

Created by Ahmad Day