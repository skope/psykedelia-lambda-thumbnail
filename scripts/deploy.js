#!/usr/bin/env node

'use strict';

const fs = require('fs');
const execFile = require('child_process').execFile;
const path = require('path');
const AWS = require('aws-sdk');
const Q = require('q');

const dirs = {
  base: path.resolve(__dirname, '..'),
  build: path.resolve(__dirname, '../build'),
  src: path.resolve(__dirname, '../src'),
  modules: path.resolve(__dirname, '../node_modules')
};

const config = require(dirs.base + '/config.json');

const lambda = new AWS.Lambda({
  signatureVersion: 'v4',
  region: config.region
});

const zipFile = dirs.base + '/psykedelia-lambda.zip';

function createZip() {
  return Q.Promise((resolve, reject) => {
    execFile(dirs.base + '/scripts/create-lambda.js', (err) =>
      (err ? reject(err) : resolve())
    );
  });
}

function deployZip(file) {
  return Q.Promise((resolve, reject) => {
    lambda.updateFunctionCode({
      FunctionName: config.lambdaFunction,
      Publish: true,
      ZipFile: file
    }, (err, data) =>
      (err ? reject(err) : resolve(data))
    );
  });
}

function readFile(path) {
  return Q.Promise((resolve, reject) => {
    fs.readFile(path, (err, data) =>
      (err ? reject(err) : resolve(data))
    );
  });
}

createZip()
  .then(() => readFile(zipFile))
  .then((file) => deployZip(file))
  .then((data) => {
    console.log('AWS deploy complete');
  })
  .fail((error) => {
    console.error(error);
  });