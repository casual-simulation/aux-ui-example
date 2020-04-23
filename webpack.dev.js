const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

// This file contains webpack settings that are used for development.
// This includes:
// -  Using fast source maps.
// -  Setting the PRODUCTION global variable to false.
// -  Configuring the webpack dev server.

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false),
        }),
    ],
    devServer: {
        contentBase: './dist',
    },
});
