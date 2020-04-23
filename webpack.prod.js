const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common.js');

// This file contains webpack settings that are used for production.
// This includes:
// -  Using content hashes for output filenames for cache busting.
// -  Setting the PRODUCTION global variable to true.
// -  High quality source maps
// -  Custom overrides for the minifier to ensure it works in all browsers.
// -  The ability to extract CSS from JS and TS files.
// -  Splitting vendor (node_modules) code from application code.
//    (This helps caching since vendor code is usually less likely to change than app code)

module.exports = merge.smart(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            minimize: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new webpack.HashedModuleIdsPlugin(),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: true,
                terserOptions: {
                    output: {
                        // Force ASCII characters so that Safari
                        // can load the worker blobs. (Safari loads them in ASCII mode)
                        // This is due to how AUX loads the web worker to ensure it uses a null origin
                        // and therefore does not have access to APIs such as IndexedDB.
                        ascii_only: true,
                    },
                },
            }),
            new OptimizeCSSAssetsPlugin({}),
        ],
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/](node_modules|public)[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    priority: 0,
                },
            },
        },
    },
});
