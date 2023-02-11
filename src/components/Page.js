/* eslint-disable no-restricted-globals */
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import ImageGallery from './ImageGallery';

import './Page.scss';

const basename = src => src.replace(/^.*[\\\/]/, '');

export default class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceDir: '',
      destinationDir: localStorage.getItem('destinationDir') || '',
      images: [],
      loaded: 0,
      current: 0
    };
    this.handleSourceFolder = this.handleSourceFolder.bind(this);
    this.handleDestinationFolder = this.handleDestinationFolder.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);

    if (localStorage.getItem('sourceDir')) {
      if (confirm('Continue where we left of ?')) {
        const lastCurrent = parseInt(localStorage.getItem('lastCurrent'), 10) || 0;
        this.setState({
          sourceDir: localStorage.getItem('sourceDir'),
          current: lastCurrent
        });
        this.handleSourceFolder(localStorage.getItem('sourceDir'), lastCurrent);
      } else {
        localStorage.setItem('sourceDir', '');
        localStorage.setItem('lastCurrent', 0);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  async handleSourceFolder(folder, setCurrent) {
    if (!folder) return;
    this.setState({
      sourceDir: folder,
      current: setCurrent || 0,
      images: []
    });

    localStorage.setItem('sourceDir', folder);
    localStorage.setItem('lastCurrent', setCurrent || 0);

    const results = await window.remote.getPics(folder);

    this.setState({ images: results }, this.readImages);
  }

  async readImages() {
    let images = [...this.state.images];

    console.log('FOUND: ', images);

    for (const i in images) {
      const image = images[i];

      // ToDo: call this in batches, and only when required

      console.log(`READING: (${i}) ${image.path.replace(/^.*[\\\/]/, '')}`);
      images[i] = await window.remote.readImage(image, window.innerWidth, window.innerHeight);

      // Update the state after getting first 10 and then every 50
      if (i === 10 || i % 50 === 0) {
        this.setState({ images, loaded: i });
      }
    }

    this.setState({ images, loaded: 0 });
  }

  handleDestinationFolder(folder) {
    if (!folder) return;
    this.setState({ destinationDir: folder });
    localStorage.setItem('destinationDir', folder);
  }

  handleKeyDown(e) {
    if (e.keyCode === 38) {
      // Up arrow
      if (!this.state.destinationDir) {
        alert('Please select destination');
        return;
      }
      const source = this.state.images[this.state.current].path;
      const target = this.state.destinationDir + '/' + basename(source);
      window.remote.copyFile(source, target).then(err => {
        if (err) throw err;
        console.log(source + ' was copied to ' + target);
        let images = [...this.state.images];
        images[this.state.current].uploaded = true;
        this.setState({ images });
      });
    } else if (e.keyCode === 40) {
      // Down arrow
      const source = this.state.images[this.state.current].path;
      if (this.state.images[this.state.current].uploaded) {
        const del = this.state.destinationDir + '/' + basename(source);
        window.remote.unlink(del).then(err => {
          if (err) throw err;
          console.log(source + ' was deleted');
          let images = [...this.state.images];
          images[this.state.current].uploaded = false;
          this.setState({ images });
        });
      } else if (confirm('Really delete ' + basename(source) + '?')) {
        window.remote.unlink(source).then(err => {
          if (err) throw err;
          console.log(source + ' was deleted');
          const images = [...this.state.images];
          images.splice(this.state.current, 1);
          this.setState({ images });
        });
      }
    }
  }

  handleSlide(currentIndex) {
    this.setState({ current: currentIndex });
    localStorage.setItem('lastCurrent', currentIndex);
  }

  render() {
    console.log(this.state.images);
    return (
      <Fragment>
        <div className={cx('settings', { withSource: this.state.sourceDir })}>
          <button
            onClick={async () => {
              const dirPath = await window.remote.selectFolder();
              this.handleSourceFolder(dirPath);
            }}
          >
            Source
          </button>
          {this.state.sourceDir}
          <br />
          <button
            onClick={async () => {
              const dirPath = await window.remote.selectFolder();
              this.handleDestinationFolder(dirPath);
            }}
          >
            Destination
          </button>
          {this.state.destinationDir}
          <br />
        </div>
        {this.state.images.length > 0 && (
          <ImageGallery
            images={this.state.images}
            startIndex={this.state.current || 0}
            onSlide={this.handleSlide}
            loaded={this.state.loaded}
          />
        )}
      </Fragment>
    );
  }
}
