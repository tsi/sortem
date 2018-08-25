// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import loadImage from 'blueimp-load-image/js';

export default class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: '',
      loadingImage: null
    };
    this.handleSrc = this.handleSrc.bind(this);
  }

  componentDidMount() {
    this.handleSrc();
  }

  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) {
      this.state.loadingImage.onload = this.state.loadingImage.onerror = null;
      this.handleSrc();
    }
  }

  handleSrc() {
    this.state.loadingImage = loadImage(
      this.props.src,
      canvas => {
        if (typeof canvas.toDataURL === 'function') {
          this.setState({ src: canvas.toDataURL('image/jpeg') });
        }
      },
      {
        maxWidth: this.props.maxWidth,
        maxHeight: this.props.maxHeight,
        canvas: true,
        orientation: true
      }
    );
  }

  render() {
    return this.state.src ? (
      <img
        src={this.state.src}
        alt={this.props.alt}
        title={this.props.title}
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: this.props.maxWidth,
          maxHeight: this.props.maxHeight
        }}
      />
    ) : null;
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  maxWidth: PropTypes.any,
  maxHeight: PropTypes.any,
  alt: PropTypes.string,
  title: PropTypes.string
};

Image.defaultProps = {
  maxWidth: 'auto',
  maxHeight: 'auto',
  title: null,
  alt: null
};
