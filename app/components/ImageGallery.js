// @flow
import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'react-icons-kit';
import { ic_check_circle as checkIcon } from 'react-icons-kit/md/ic_check_circle';
import Image from './Image';

export default class ImageGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: this.props.startIndex
    };
    this.handleSlide = this.handleSlide.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderThumbs = this.renderThumbs.bind(this);
    this.renderLazyThumb = this.renderLazyThumb.bind(this);
  }

  componentWillMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleSlide(nextCurrent) {
    this.setState({ current: nextCurrent });
    this.props.onSlide(nextCurrent);
  }

  handleKeyDown(e) {
    if (e.keyCode === 39) {
      // Right arrow
      if (this.state.current + 1 < this.props.images.length) {
        this.handleSlide(this.state.current + 1);
      }
    } else if (e.keyCode === 37) {
      // Left arrow
      if (this.state.current > 0) {
        this.handleSlide(this.state.current - 1);
      }
    }
  }

  renderItem(index) {
    const item = this.props.images[index];
    return item ? (
      <div className="image-gallery-image">
        {item.type === 'video' ? (
          <video src={item.src} title={item.originalTitle} controls autoPlay />
        ) : (
          <Image
            src={item.src}
            alt={item.originalAlt}
            title={item.originalTitle}
            maxWidth={document.body.clientWidth}
            maxHeight={document.body.clientHeight}
          />
        )}
        {item.uploaded && (
          <Icon className="uploaded" size={32} icon={checkIcon} />
        )}
      </div>
    ) : null;
  }

  renderThumbs() {
    return (
      <div className="image-gallery-thumbnails">
        <div className="image-gallery-count">
          {this.state.current + 1} of {this.props.images.length}
        </div>
        <div
          className="image-gallery-thumbnails-container"
          style={{
            transform: 'translateX(-' + (this.state.current + 0.5) * 148 + 'px)'
          }}
        >
          {this.props.images.map((item, index) =>
            this.renderLazyThumb(item, index)
          )}
        </div>
      </div>
    );
  }

  renderLazyThumb(item, arrIndex) {
    return (
      <div
        key={item.index}
        className={cx('image-gallery-thumbnail', {
          active: this.state.current === arrIndex
        })}
        onClick={() => this.handleSlide(arrIndex)}
        role="menuItem"
        tabIndex="0"
      >
        {Math.abs(this.state.current - arrIndex) < 10 && (
          <Image
            src={
              item.type === 'image'
                ? item.src
                : 'https://cdn.pixabay.com/photo/2017/03/13/04/25/play-button-2138735_960_720.png'
            }
            alt={item.thumbnailAlt}
            title={item.thumbnailTitle}
            maxWidth={140}
            maxHeight={140}
          />
        )}
        {item.uploaded && <Icon className="uploaded" icon={checkIcon} />}
      </div>
    );
  }

  render() {
    return this.props.images ? (
      <Fragment>
        {this.renderItem(this.state.current)}
        {this.renderThumbs(this.state.current)}
      </Fragment>
    ) : null;
  }
}

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object),
  startIndex: PropTypes.number.isRequired,
  onSlide: PropTypes.func
};

ImageGallery.defaultProps = {
  images: [],
  onSlide: null
};
