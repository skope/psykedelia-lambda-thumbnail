'use strict';

const Q = require('q');
const path = require('path');
const gm = require('gm').subClass({
  imageMagick: true
});

class Thumbnail {
  constructor(options) {
    this.options = options;
  }

  exec(file, filename) {
    return Q.Promise((resolve, reject) => {
      gm(file.Body)
        .resize(this.options.width, this.options.height, '^')
        .gravity('Center')
        .extent(this.options.width, this.options.height)
        .toBuffer((error, buffer) =>
          (error ? reject(error) : resolve({
            Body: buffer,
            ContentType: file.ContentType
          }))
        );
    });
  }
}

module.exports = Thumbnail;