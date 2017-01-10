#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const Q = require('q');

const archiver = require('archiver');
const ncp = require('ncp').ncp;
const exec = require('child_process').exec;

const dirs = {
  base: path.resolve(__dirname, '..'),
  build: path.resolve(__dirname, '../build'),
  src: path.resolve(__dirname, '../src'),
  modules: path.resolve(__dirname, '../node_modules')
};

const index = path.resolve(__dirname, '../index.js');

if (!fs.existsSync(dirs.build)) {
  fs.mkdirSync(dirs.build);
}

ncp.stopOnErr = true;

function copyModules(modules, build) {
  return Q.Promise((resolve, reject) => {
    ncp(modules, build + '/node_modules', (err) =>
      (err ? reject(err) : resolve())
    );
  });
}

function copySrc(src, build) {
  return Q.Promise((resolve, reject) => {
    ncp(src, build + '/src', (err) =>
      (err ? reject(err) : resolve())
    );
  });
}

function copyIndex(idx, build) {
  return Q.Promise((resolve, reject) => {
    const file = fs.createReadStream(idx);
    const output = fs.createWriteStream(build + '/index.js');

    file.on('error', (err) => {
      reject(err);
    });

    output.on('finish', () => {
      resolve();
    })

    file.pipe(output);
  });
}

function zipFiles(base, build) {
  return Q.Promise((resolve, reject) => {
    const output = fs.createWriteStream(base + '/psykedelia-lambda.zip');
    let archive = archiver('zip');

    output.on('close', () => {
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(build, false);

    archive.finalize();
  });
}

function removeBuildDir(build) {
  return Q.Promise((resolve, reject) => {
    exec('rm -r ' + build, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
}

copyModules(dirs.modules, dirs.build)
  .then(() => copySrc(dirs.src, dirs.build))
  .then(() => copyIndex(index, dirs.build))
  .then(() => zipFiles(dirs.base, dirs.build))
  .then(() => removeBuildDir(dirs.build))
  .then(() => console.log('Lambda zip creation completed'))
  .fail((error) => {
    console.error(error);
  });