'use strict';

const S3 = require('./src/s3');
const Thumbnail = require('./src/thumbnail');

const thumbnail = new Thumbnail({
  width: process.env.THUMB_WIDTH,
  height: process.env.THUMB_HEIGHT
});

exports.handler = (event, context) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const destination = process.env.THUMB_PATH + key.substr(key.lastIndexOf('/'));

  const client = new S3({
    bucket: bucket
  });

  client.download(key)
    .then((file) => thumbnail.exec(file, key))
    .then((file) => client.upload(destination, file.Body, file.ContentType))
    .then(() => context.succeed('Image ' + key + ' finished processing'))
    .fail((error) => context.fail(error));
};