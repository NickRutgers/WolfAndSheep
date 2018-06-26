import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ItemTypes } from './Constants';
import { DragSource } from 'react-dnd';

const wolfSource = {
  beginDrag(props, monitor, component) {
    return {
      position: component.props.position,
    };
  },
  canDrag(props) {
    return props.draggable;
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class Wolf extends Component {
  render() {
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <div style={{
        opacity: isDragging ? 0.5 : 1,
        fontSize: 25,
        fontWeight: 'bold',
        cursor: 'move',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        alignContent: 'center'
      }}>
        <span style={{
          width: '100%',
          textAlign: 'center',
        }}>
          <img src="/wolf.png" style={{
            display: 'inline-block',
            maxWidth: '90%',
            maxHeight: '90%',
          }}/>
        </span>
      </div>
    );
  }
}

Wolf.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(ItemTypes.WOLF, wolfSource, collect)(Wolf);