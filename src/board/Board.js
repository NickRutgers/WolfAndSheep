import React, { Component } from 'react';
import BoardSquare from './BoardSquare';
import Wolf from './Wolf';
import Sheep from './Sheep';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {
  addChangeListener,
  addMoveListener,
  removeChangeListener,
  removeMoveListener,
  startNewGame,
  doAImove
} from './Game';
import { ItemTypes } from './Constants';

class Board extends Component {
  state = {
    wolfPosition: {
      x: -1,
      y: -1,
    },
    sheepPositions: [
      {
        x: -1,
        y: -1,
      }, {
        x: -1,
        y: -1,
      }, {
        x: -1,
        y: -1,
      }, {
        x: -1,
        y: -1,
      },
    ],
    AI: {
      [ItemTypes.WOLF]: false,
      [ItemTypes.SHEEP]: false,
    },
    turn: null,
  };

  componentDidMount() {
    startNewGame();
    addChangeListener(this.changeListener);
    addMoveListener(this.moveListener);
  }

  componentWillUnmount() {
    removeChangeListener(this.changeListener);
    removeMoveListener(this.moveListener);
  }

  changeListener = ({wolfPosition, sheepPositions, turn, winner}) => {
    this.setState({
      wolfPosition,
      sheepPositions,
      turn,
    }, () => {
      if (winner) {
        setTimeout(() => {
          alert(`${winner === ItemTypes.WOLF ? 'Mr. Wolf' : 'Maaah'} wins`);
          startNewGame();
        }, 1000);
      }
    });
  };

  moveListener = ({turn}) => {
    if (this.state.AI[turn]) {
      this.doAImove(turn);
    }
  }

  toggleAI(evt, type) {
    const enabled = !this.state.AI[type];
    this.setState({
      AI: {
        ...this.state.AI,
        [type]: enabled,
      }
    }, () => {
      if (enabled && this.state.turn === type) {
        this.doAImove(type);
      }
    });
  }

  doAImove(type) {
    setTimeout(() => doAImove(), 200);
  }

  renderSquare(i) {
    const x = i % 8;
    const y = Math.floor(i / 8);
    return (
      <div key={i}
           style={{ width: '12.5%', height: '12.5%' }}>
        <BoardSquare x={x}
                     y={y}>
          {this.renderPiece(x, y)}
        </BoardSquare>
      </div>
    );
  }

  renderPiece(x, y) {
    const {
      wolfPosition,
      sheepPositions,
      turn,
      AI
    } = this.state;
    if (wolfPosition.x === x && wolfPosition.y === y) {
      return <Wolf position={wolfPosition} draggable={turn === ItemTypes.WOLF && !AI[ItemTypes.WOLF]} />;
    }
    for (let index = 0; index < sheepPositions.length; index++) {
      const sheepPosition = sheepPositions[index];
      if (sheepPosition.x === x && sheepPosition.y === y) {
        return <Sheep position={sheepPosition} draggable={turn === ItemTypes.SHEEP && !AI[ItemTypes.SHEEP]}/>;
      }
    }
  }

  render() {
    const squares = [];
    for (let i = 0; i < 64; i++) {
      squares.push(this.renderSquare(i));
    }

    return (
      <form onSubmit={e => e.preventDefault()}>
        <input
          type="checkbox"
          checked={this.state.AI[ItemTypes.SHEEP]}
          id="sheep-ai"
          onChange={(evt) => this.toggleAI(evt, ItemTypes.SHEEP)}
        />
        <label htmlFor="sheep-ai">Use AI for sheep</label>
        <br/>
        <input
          type="checkbox"
          checked={this.state.AI[ItemTypes.WOLF]}
          id="wolf-ai"
          onChange={(evt) => this.toggleAI(evt, ItemTypes.WOLF)}
        />
        <label htmlFor="wolf-ai">Use AI for wolf</label>
        <br/>
        <p>Turn for {this.state.turn === ItemTypes.SHEEP ? 'meeeh' : 'mr. Wolf'}</p>
        <div style={{
          width: '600px',
          height: '600px',
          display: 'flex',
          flexWrap: 'wrap'
        }}>
          {squares}
        </div>
      </form>
    );
  }
}

export default DragDropContext(HTML5Backend)(Board);
