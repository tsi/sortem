// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Image extends Component {
  render() {
    return (
      <img
        src={this.props.src}
        alt={this.props.alt}
        title={this.props.title}
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: this.props.maxWidth,
          maxHeight: this.props.maxHeight
        }}
      />
    );
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
