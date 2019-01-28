// @flow
import React, { Component, Fragment } from 'react';
import { remote } from 'electron';
import Store from 'electron-store';
import cx from 'classnames';
import getPics from './getPics';
import ImageGallery from './ImageGallery';

import styles from './Page.scss';

const fs = require('electron').remote.require('fs');
const path = require('electron').remote.require('path');

const store = new Store();

export default class Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceDir: '',
      destinationDir: store.get('destinationDir') || '',
      images: [],
      current: 0
    };
    this.handleSourceFolder = this.handleSourceFolder.bind(this);
    this.handleDestinationFolder = this.handleDestinationFolder.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
  }

  componentWillMount() {
    window.addEventListener('keydown', this.handleKeyDown);

    if (store.get('sourceDir')) {
      if (confirm('Continue where we left of ?')) {
        const lastCurrent = store.get('lastCurrent') || 0;
        this.setState({
          sourceDir: store.get('sourceDir'),
          current: lastCurrent
        });
        this.handleSourceFolder([store.get('sourceDir')], lastCurrent);
      } else {
        store.set('sourceDir', '');
        store.set('lastCurrent', 0);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleSourceFolder(folder, setCurrent) {
    if (!folder) return;
    this.setState({
      sourceDir: folder[0],
      current: setCurrent || 0,
      images: []
    });
    store.set('sourceDir', folder[0]);
    store.set('lastCurrent', setCurrent || 0);
    const that = this;
    getPics(folder[0], (err, results) => {
      if (err) throw err;
      console.log(results);
      that.setState({ images: results });
    });
  }

  handleDestinationFolder(folder) {
    if (!folder) return;
    this.setState({ destinationDir: folder[0] });
    store.set('destinationDir', folder[0]);
  }

  handleKeyDown(e) {
    if (e.keyCode === 38) {
      // Up arrow
      if (!this.state.destinationDir) {
        alert('Please select destination');
        return;
      }
      const source = this.state.images[this.state.current].src;
      const target = this.state.destinationDir + '/' + path.basename(source);
      fs.copyFile(source, target, err => {
        if (err) throw err;
        console.log(source + ' was copied to ' + target);
        // ToDo: no state mutations
        this.state.images[this.state.current].uploaded = true;
        this.forceUpdate();
      });
    } else if (e.keyCode === 40) {
      // Down arrow
      const source = this.state.images[this.state.current].src;
      if (this.state.images[this.state.current].uploaded) {
        const del = this.state.destinationDir + '/' + path.basename(source);
        fs.unlink(del, err => {
          if (err) throw err;
          console.log(source + ' was deleted');
        });
        this.state.images[this.state.current].uploaded = false;
        this.forceUpdate();
      } else if (confirm('Really delete ' + path.basename(source) + '?')) {
        fs.unlink(source, err => {
          if (err) throw err;
          console.log(source + ' was deleted');
          const images = [...this.state.images]; // make a separate copy of the images
          images.splice(this.state.current, 1);
          this.setState({ images });
        });
      }
    }
  }

  handleSlide(currentIndex) {
    this.setState({ current: currentIndex });
    store.set('lastCurrent', currentIndex);
  }

  render() {
    const settings = cx(styles.settings, {
      [styles.withSource]: this.state.sourceDir
    });

    return (
      <Fragment>
        <div className={settings}>
          <button
            onClick={() =>
              remote.dialog.showOpenDialog(
                { properties: ['openDirectory'] },
                this.handleSourceFolder
              )
            }
          >
            Source
          </button>
          {this.state.sourceDir}
          <br />
          <button
            onClick={() =>
              remote.dialog.showOpenDialog(
                { properties: ['openDirectory'] },
                this.handleDestinationFolder
              )
            }
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
          />
        )}
      </Fragment>
    );
  }
}
