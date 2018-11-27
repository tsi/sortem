// import { remote } from 'electron';

const fs = require('electron').remote.require('fs');
const path = require('electron').remote.require('path');

const imageExtensions = ['.gif', '.jpg', '.jpeg', '.png'];
const videoExtensions = ['.mov', '.mp4', '.avi'];

let index = 0;

export default function getPics(dir, done, recourse) {
  let results = [];
  if (!recourse) {
    index = 0;
  }
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, (err2, stat) => {
        if (stat && stat.isDirectory()) {
          getPics(
            file,
            (err3, res) => {
              results = results.concat(res);
              next();
            },
            true
          );
        } else {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.concat(videoExtensions).indexOf(ext) > -1) {
            results.push({
              src: file,
              type: videoExtensions.indexOf(ext) > -1 ? 'video' : 'image',
              index: index++
            });
          }
          next();
        }
      });
    })();
  });
}
