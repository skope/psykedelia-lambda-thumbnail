'use strict';

const AWS = require('aws-sdk');
const Q = require('q');
const bucket = new AWS.S3({
  signatureVersion: 'v4'
});

class S3 {
  constructor(options) {
    this.options = options;
  }

  download(key) {
    return Q.Promise((resolve, reject) => {
      bucket.getObject({
        Bucket: this.options.bucket,
        Key: key
      }, (error, result) =>
        (error ? reject(error) : resolve(result))
      );
    });
  }

  upload(key, file, contentType) {
    return Q.Promise((resolve, reject) => {
      bucket.putObject({
        Bucket: this.options.bucket,
        Key: key,
        Body: file,
        ContentType: contentType || '',
        ACL: 'public-read'
      }, (error, result) =>
        (error ? reject(error) : resolve(result))
      );
    });
  }
}

module.exports = S3;