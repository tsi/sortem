// @flow
import React, { Component, Fragment } from 'react';
import { remote } from 'electron';
import Store from 'electron-store';
import ImageGallery from 'react-image-gallery';
import { Icon } from 'react-icons-kit'
import { ic_check_circle } from 'react-icons-kit/md/ic_check_circle'
import getPics from './getPics';
import Image from './Image';

import styles from './Home.scss';

const fs = require('electron').remote.require('fs');
const path = require('electron').remote.require('path');

const store = new Store();

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceDir: '',
      destinationDir: store.get('destinationDir') || '',
      images: [],
      current: 0,
    };
    this.handleSourceFolder = this.handleSourceFolder.bind(this);
    this.handleDestinationFolder = this.handleDestinationFolder.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.renderThumbInner = this.renderThumbInner.bind(this);
  }

  componentWillMount(){
    window.addEventListener("keydown", this.handleKeyDown);

    if (store.get('sourceDir') && store.get('lastCurrent')) {
      if (confirm("Continue where we left of ?")) {
        this.setState({
          sourceDir: store.get('sourceDir'),
          current: store.get('lastCurrent')
        });
        this.handleSourceFolder([store.get('sourceDir')], store.get('lastCurrent'));
      }
      else {
        store.set('sourceDir', '');
        store.set('lastCurrent', 0);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleSourceFolder(folder, setCurrent) {
    if (!folder) return;
    this.setState({
      sourceDir: folder[0],
      current: setCurrent || 0,
      images: []
    });
    store.set('sourceDir', folder[0]);
    const that = this;
    getPics(folder[0], (err, results) => {
      if (err) throw err;
      console.log(results);
      that.setState({images: results});
    });
  }

  handleDestinationFolder(folder) {
    if (!folder) return;
    this.setState({ destinationDir: folder[0] });
    store.set('destinationDir', folder[0]);
  }

  handleKeyDown(e) {
    if (e.keyCode === 38) {
      // up arrow
      if (!this.state.destinationDir) {
        alert("Please select destination");
        return;
      }
      const source = this.state.images[this.state.current].original;
      const target = this.state.destinationDir + '/' + path.basename(source);
      fs.copyFile(source, target, (err) => {
        if (err) throw err;
        console.log(source + ' was copied to ' + target);
        // ToDo: no state mutations
        this.state.images[this.state.current].uploaded = true;
        this.forceUpdate();
      });

    }
    else if (e.keyCode === 40) {
      // down arrow
      const that = this;
      const source = this.state.images[this.state.current].original;
      if (confirm("Really delete " + path.basename(source) + "?")) {
        fs.unlink(source, (err) => {
          if (err) throw err;
          console.log(source + ' was deleted');
          // ToDo: no state mutations
          delete this.state.images[this.state.current];
          this.forceUpdate();
        });
      }
    }
  }

  handleSlide(currentIndex) {
    this.setState({ current: currentIndex });
    store.set('lastCurrent', currentIndex);
  }

  renderItem(item) {
    if (Math.abs(this.state.current - item.index) > 2) return null;
    return (
      <div className='image-gallery-image'>
        {item.type === 'video' ? (
          <video
            src={item.original}
            title={item.originalTitle}
            controls
          />
        ) : (
          <Image
            src={item.original}
            alt={item.originalAlt}
            title={item.originalTitle}
            maxWidth={document.body.clientWidth}
          />
        )}
        {item.uploaded &&
          <Icon className="uploaded" size={32} icon={ic_check_circle} />
        }
      </div>
    )
  }

  renderThumbInner(item) {
    if (Math.abs(this.state.current - item.index) > 15) return null;
    return (
      <div className='image-gallery-thumbnail-inner'>
        <Image
          src={item.type === 'image' ? item.thumbnail : ''}
          alt={item.thumbnailAlt}
          title={item.thumbnailTitle}
          maxWidth={100}
        />
        {item.uploaded &&
          <Icon className="uploaded" icon={ic_check_circle} />
        }
      </div>
    )
  }

  render() {
    return (
      <Fragment>
        <div className={styles.header}>
          <button onClick={() => remote.dialog.showOpenDialog(
            { properties: ['openDirectory'] },
            this.handleSourceFolder
          )}>
            Source
          </button>
          {this.state.sourceDir}
          <br />
          <button onClick={() => remote.dialog.showOpenDialog(
            { properties: ['openDirectory'] },
            this.handleDestinationFolder
          )}>
            Destination
          </button>
          {this.state.destinationDir}
        </div>
        {this.state.images.length > 0 &&
          <ImageGallery
            items={this.state.images}
            infinite={false}
            lazyLoad
            showFullscreenButton={false}
            showPlayButton={false}
            slideDuration={0}
            startIndex={this.state.current || 0}
            onSlide={this.handleSlide}
            renderItem={this.renderItem}
            renderThumbInner={this.renderThumbInner}
          />
        }
      </Fragment>
    );
  }
}
