import { ItemTypes } from './Constants';
import ee from 'event-emitter';

const emitter = ee();

/**
 * Current state
 */

let wolfPosition = {
  x: -1,
  y: -1,
};

let sheepPositions = [];

let winner = null;
let turn = null;

/**
 * Event listener
 */

function emitChange() {
  winner = checkForWinner();
  emitter.emit('change', {
    wolfPosition,
    sheepPositions,
    turn,
    winner,
  });
}

function emitMove() {
  emitter.emit('move', {
    turn,
  });
}

export function addChangeListener(listener) {
  emitter.on('change', listener);
  emitChange();
}

export function removeChangeListener(listener) {
  emitter.off('change', listener);
}

export function addMoveListener(listener) {
  emitter.on('move', listener);
}

export function removeMoveListener(listener) {
  emitter.off('move', listener);
}

/**
 * Game functions
 */

export function startNewGame() {
  wolfPosition = {
    x: 4,
    y: 7,
  };

  sheepPositions = [
    {
      x: 1,
      y: 0,
    }, {
      x: 3,
      y: 0,
    }, {
      x: 5,
      y: 0,
    }, {
      x: 7,
      y: 0,
    },
  ];

  winner = null;
  turn = ItemTypes.WOLF;
  emitChange();
}

function getPossibleMovesForSheep(wolf = wolfPosition, sheep = sheepPositions) {
  const possibleMovesForSheep = [];
  sheep.forEach(from => {
    const neighborsOfSheep = [
      {
        x: from.x - 1,
        y: from.y + 1
      }, {
        x: from.x + 1,
        y: from.y + 1
      }
    ];
    neighborsOfSheep.forEach(to => {
      // Is the field outside of the board?
      if (to.x < 0 || to.x > 7 || to.y < 0 || to.y > 7) {
        return;
      }
      if(!getPieceAtPosition(to, wolf, sheep)) {
        possibleMovesForSheep.push({
          from, to,
        })
      }
    });
  });
  return possibleMovesForSheep;
}

function getPossibleMovesForWolf(wolf = wolfPosition, sheep = sheepPositions) {
  const neighborsOfWolf = [
    {
      x: wolf.x - 1,
      y: wolf.y - 1,
    }, {
      x: wolf.x + 1,
      y: wolf.y - 1,
    }, {
      x: wolf.x - 1,
      y: wolf.y + 1,
    }, {
      x: wolf.x + 1,
      y: wolf.y + 1,
    }
  ];
  const possibleMovesForWolf = neighborsOfWolf.filter(position => {
    // Is the field outside of the board?
    if (position.x < 0 || position.x > 7 || position.y < 0 || position.y > 7) {
      return false;
    }
    // Is there a sheep on the field?
    return !sheep.find(sheepPosition => sheepPosition.x === position.x && sheepPosition.y === position.y);
  })
  .map(to => ({
    from: wolfPosition,
    to,
  }));

  return possibleMovesForWolf;
}

function getPieceAtPosition(position, wolf = wolfPosition, sheep = sheepPositions) {
  if (!position) {
    return null;
  }
  if (wolf.x === position.x && wolf.y === position.y) {
    return {
      type: ItemTypes.WOLF,
      position: wolf,
    };
  }
  for (let index = 0; index < sheep.length; index++) {
    const sheepPosition = sheep[index];
    if (sheepPosition.x === position.x && sheepPosition.y === position.y) {
      return {
        type: ItemTypes.SHEEP,
        position: sheepPosition,
      };
    }
  }
  return null;
}

function checkForWinner() {
  if (wolfPosition.y === 0) {
    return ItemTypes.WOLF;
  }
  const possibleMovesForWolf = getPossibleMovesForWolf();
  if (!possibleMovesForWolf.length) {
    return ItemTypes.SHEEP;
  }

  const possibleMovesForSheep = getPossibleMovesForSheep();
  if (!possibleMovesForSheep.length) {
    return ItemTypes.WOLF;
  }

  return null;
}

export function movePiece(from, to) {
  if (canMovePiece(from, to)) {
    const fromPiece = getPieceAtPosition(from);
    if (fromPiece.type === ItemTypes.WOLF) {
      wolfPosition = {
        x: to.x,
        y: to.y,
      };
      turn = ItemTypes.SHEEP;
      emitChange();
      emitMove();
    } else if (fromPiece.type === ItemTypes.SHEEP) {
      sheepPositions = sheepPositions.map(sheepPosition => {
        if (sheepPosition.x === from.x && sheepPosition.y === from.y) {
          return {
            x: to.x,
            y: to.y,
          };
        } else {
          return sheepPosition;
        }
      });
      turn = ItemTypes.WOLF;
      emitChange();
      emitMove();
    }
  }
}

export function canMovePiece(from, to) {
  if (winner) return false;
  const fromPiece = getPieceAtPosition(from);
  const toPiece = getPieceAtPosition(to);
  if (!fromPiece || toPiece || fromPiece.type !== turn) return false;
  const deltaX = to.x - from.x;
  if (Math.abs(deltaX) !== 1) return false;
  const deltaY = to.y - from.y;
  if (fromPiece.type === ItemTypes.WOLF) {
    if (Math.abs(deltaY) !== 1) return false;
  } else if (fromPiece.type === ItemTypes.SHEEP) {
    if (deltaY !== 1) return false;
  }

  return true;
}

/**
 * AI shit
 */

function getPossibleMoves(wolf = wolfPosition, sheep = sheepPositions) {
  if (turn === ItemTypes.WOLF) {
    return getPossibleMovesForWolf(wolf, sheep);
  } else if (turn === ItemTypes.SHEEP) {
    return getPossibleMovesForSheep(wolf, sheep);
  }
  return [];
}

function getClosestEdgeDistance(wolfPosition, sheepPositions, x, y) {
  let edge = {
    x: wolfPosition.x + x,
    y: wolfPosition.y + y,
  };
  let distance = 0;
  while(
    edge.x > 0 &&
    edge.x < 8 &&
    edge.y > 0 &&
    edge.y < 8
    // &&
    // !sheepPositions.find(sheep => sheep.x === edge.x && sheep.y === edge.y)
  ) {
    edge = {
      x: edge.x + x,
      y: edge.y + y,
    };
    distance++;
  }
  return distance;
}

function ratePositions(
  wolfPosition, // {x, y}
  sheepPositions, // [{x, y}, {x, y}]
  rateForPlayer // 'wolf'|'sheep'
) {
  // This calculation is for the wolf player
  let score = 0;
  score -= (1 - (1 / (wolfPosition.y + 1))) * 1000;
  sheepPositions.forEach(sheepPosition => {
    const distanceX = Math.abs(sheepPosition.x - wolfPosition.x);
    const distanceY = Math.abs(sheepPosition.y - wolfPosition.y);
    const distance = Math.max(distanceX, distanceY);
    score -= 100 / distance;
    score += Math.pow(sheepPosition.y, 1.4) * 30;
  });
  const distances = [
    getClosestEdgeDistance(wolfPosition, sheepPositions, -1, -1),
    getClosestEdgeDistance(wolfPosition, sheepPositions, 1, -1),
    getClosestEdgeDistance(wolfPosition, sheepPositions, -1, 1),
    getClosestEdgeDistance(wolfPosition, sheepPositions, 1, 1),
  ];
  (distances).forEach(distance => {
    score += (1 - (1 / (distance + 1))) * 80;
  });
  return rateForPlayer === ItemTypes.WOLF ? score : -score;
}

function rateSituation(
  depth, // int
  wolfPosition, // {x, y}
  sheepPositions, // [{x, y}, {x, y}]
  turn, // 'wolf'|'sheep'
  rateForPlayer // 'wolf'|'sheep'
) {
  if (depth <= 0) {
    return ratePositions(
      wolfPosition,
      sheepPositions,
      rateForPlayer
    );
  } else {
    const moves = getPossibleMoves(wolfPosition, sheepPositions);
    let worstMove = null;
    let worstScore = null;
    moves.forEach(move => {
      const newSituation = applyMoveToSituation(move, depth, wolfPosition, sheepPositions, turn);
      const scoreForMove = rateSituation(newSituation.depth, newSituation.wolfPosition, newSituation.sheepPositions, newSituation.turn, rateForPlayer);
      if (!worstMove) {
        worstMove = move;
        worstScore = scoreForMove;
      } else if (scoreForMove < worstScore) {
        worstScore = scoreForMove;
        worstMove = move;
      }
    });
    return worstScore;
  }
}

function applyMoveToSituation(move, depth, wolfPosition, sheepPositions, turn) {
  let newWolfPosition, newSheepPositions;
  if (wolfPosition.x === move.from.x && wolfPosition.y === move.from.y) {
    // wolf is moving
    newWolfPosition = move.to;
    newSheepPositions = sheepPositions;
  } else {
    // sheep is moving
    newWolfPosition = wolfPosition;
    newSheepPositions = sheepPositions.map(sheepPosition => {
      if (sheepPosition.x === move.from.x && sheepPosition.y === move.from.y) {
        return move.to;
      } else {
        return sheepPosition;
      }
    });
  }
  return {
    depth: depth - 1,
    wolfPosition: newWolfPosition,
    sheepPositions: newSheepPositions,
    turn: (turn === ItemTypes.SHEEP) ? ItemTypes.WOLF : ItemTypes.SHEEP,
  };
}

function getBestMove(
  depth, // int
  wolfPosition, // {x, y}
  sheepPositions, // [{x, y}, {x, y}]
  turn, // 'wolf'|'sheep'
  rateForPlayer // 'wolf'|'sheep'
) {
  const moves = getPossibleMoves(wolfPosition, sheepPositions);
  let bestMove = null;
  let bestScore = null;
  moves.forEach(move => {
    const newSituation = applyMoveToSituation(move, depth, wolfPosition, sheepPositions, turn);
    const scoreForMove = rateSituation(newSituation.depth, newSituation.wolfPosition, newSituation.sheepPositions, newSituation.turn, rateForPlayer);
    // console.log(JSON.stringify({
    //   move,
    //   scoreForMove,
    //   // newSituation,
    // }, null, 2), newSituation);
    if (!bestMove) {
      bestMove = move;
      bestScore = scoreForMove;
    } else if (scoreForMove > bestScore) {
      bestScore = scoreForMove;
      bestMove = move;
    }
  });
  return bestMove;
}

export function doAImove() {
  const move = getBestMove(3, wolfPosition, sheepPositions, turn, turn);
  if (move) {
    movePiece(move.from, move.to);
  }
}
