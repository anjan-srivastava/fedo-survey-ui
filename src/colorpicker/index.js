'use strict'

import React from 'react'
import reactCSS from 'reactcss'
import { ChromePicker } from 'react-color'
class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    let color = this.torgba(this.props.color) || {r: '255', g: '255', b: '255', a: '1'};
    this.state = {
        displayColorPicker: false,
        color: color,
    };
  }

  componentWillReceiveProps(nextProps) {
      let newColor = nextProps.color,
        currentColor = this.state.color;

      newColor = this.torgba(newColor);
      if (newColor &&
              (newColor.r != currentColor.r ||
              newColor.g != currentColor.g ||
              newColor.b != currentColor.b )) {
        this.state.color = newColor;
        this.setState(Object.assign({}, this.state));
      }
  }

  torgba(hex) {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return { r: (c>>16)&255, g: (c>>8)&255, b: c&255, a: 1 };
    }
    return null;
  }
  
  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb });
    if (this.props.onChange) this.props.onChange(color);
  };

  render() {

    const styles = reactCSS({
      'default': {
        color: {
          width: '10px',
          height: '10px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
        },
        swatch: {
          padding: '1px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          bottom: '10px',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    return (
      <div style={{display: 'inline-block'}} className= { 'outreech-colorpicker '}>
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <ChromePicker disableAlpha = { true } color={ this.state.color } onChange={ this.handleChange } />
        </div> : null }

      </div>
    )
  }
}

export default ColorPicker;

