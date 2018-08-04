// @flow
import React, { Component } from 'react';
import loadImage from 'blueimp-load-image/js';

export default class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: '',
    };
  }

  componentWillMount() {
    loadImage(this.props.src, (canvas) => {
      this.setState({ src: canvas.toDataURL("image/jpeg") })
    }, {
      maxWidth: this.props.maxWidth,
      canvas: true,
      orientation: true,
    })
  }

  render() {
    return this.state.src ? (
      <img
        src={this.state.src}
        alt={this.props.alt}
        title={this.props.title}
      />
    ) : null;
  }
}
