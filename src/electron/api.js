const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const initApi = () => {
  ipcMain.handle('selectFolder', selectFolder);
  ipcMain.handle('getPics', getPics);
  ipcMain.handle('readImage', readImage);
  ipcMain.handle('copyFile', copyFile);
  ipcMain.handle('unlink', unlink);
};

async function selectFolder() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });

  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
}

const IMAGE_EXTENSIONS = ['.gif', '.jpg', '.jpeg', '.png'];
const VIDEO_EXTENSIONS = ['.mov', '.mp4', '.avi'];
let index = 0;

async function getPics(event, dir) {
  const files = await new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });

  const mediaFiles = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
        }
        resolve(stats);
      });
    });

    if (stats.isDirectory()) {
      mediaFiles.push(...(await getPics(null, filePath)));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      mediaFiles.push({
        path: filePath,
        type: 'image',
        index: index++
      });
    } else if (VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      mediaFiles.push({
        path: filePath,
        type: 'video',
        index: index++
      });
    }
  }

  return mediaFiles;
}

async function readImage(event, img, width, height) {
  const readFile = async (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.toString('base64'));
      });
    });
  };

  const resizeImg = async (imageData, width = 140, height) => {
    const buffer = Buffer.from(imageData, 'base64');
    return sharp(buffer)
      .resize({
        width: width,
        height: height || width,
        fit: 'contain'
      })
      .toBuffer()
      .then((data) => `data:image/jpeg;base64,${data.toString('base64')}`);
  };

  if (img.type === 'image') {
    const imgData = await readFile(img.path);
    const imgURI = await resizeImg(imgData, width, height || width);
    const resizedImgURI = await resizeImg(imgData, 140);
    return {
      ...img,
      src: imgURI,
      thumbSrc: resizedImgURI
    };
  } else if (img.type === 'video') {
    return {
      ...img,
      src: img.path
    };
  }
}

async function copyFile(event, source, target) {
  function callback(err) {
    if (err) throw err;
    console.log(source + ' was copied to ' + target);
  }

  fs.copyFile(source, target, callback);
}

async function unlink(event, source) {
  function callback(err) {
    if (err) throw err;
    console.log(source + ' was deleted');
  }

  fs.unlink(source, callback);
}

module.exports = initApi;
