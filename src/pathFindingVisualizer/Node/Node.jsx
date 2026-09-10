import React from 'react';
import './Node.css';

function Node({
  col,
  row,
  isFinish,
  isStart,
  isWall,
  isWeight,
  mouseIsPressed,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) {
  const className = [
    'node',
    isFinish ? 'node-finish' : '',
    isStart ? 'node-start' : '',
    isWall ? 'node-wall' : '',
    isWeight ? 'node-weight' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={`node-${row}-${col}`}
      className={className}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
      onTouchStart={(e) => {
        e.preventDefault();
        onMouseDown(row, col);
      }}
    ></div>
  );
}

export default Node;