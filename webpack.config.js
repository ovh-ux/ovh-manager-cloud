const merge = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const _ = require('lodash');

/* eslint-disable import/no-unresolved, import/no-extraneous-dependencies */
const { config } = require('@ovh-ux/manager-webpack-config')({
  template: './client/index.html',
  basePath: './client',
  lessPath: [
    './client/app',
    './client/components',
    './node_modules',
  ],
  root: path.resolve(__dirname, './client/app'),
  assets: {
    files: [
      { from: path.resolve(__dirname, './client/assets'), to: 'assets' },
      { from: path.resolve(__dirname, './node_modules/angular-i18n'), to: 'angular-i18n' },
      { from: path.resolve(__dirname, './client/**/*.html'), context: 'client' },
    ],
  },
});
/* eslint-enable */

const folder = './client/app';
const bundles = {};

fs.readdirSync(folder).forEach((file) => {
  const stats = fs.lstatSync(`${folder}/${file}`);
  if (stats.isDirectory()) {
    const jsFiles = glob.sync(`${folder}/${file}/**/!(*.spec|*.mock).js`);
    if (jsFiles.length > 0) {
      bundles[file] = jsFiles;
    }
  }
});

module.exports = merge(config, {
  entry: _.assign({
    main: './client/app/index.js',
    components: glob.sync('./client/components/**/!(*.spec|*.mock).js'),
    config: ['./client/app/config/all.js', `./client/app/config/${process.env.WEBPACK_SERVE ? 'dev' : 'prod'}.js`],
  }, bundles),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  /*
  resolve: {
    alias: {
      jquery: path.resolve(__dirname, 'node_modules/jquery'),
    },
  },
  */
});
