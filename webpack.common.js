const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// This file contains common webpack settings that are shared
// between development and production.
// Most webpack settings are in this file.

module.exports = {
    // We have two entry points.
    // One for our UI client and one
    // for the AUX Virtual Machine.
    entry: {
        // This is our UI entry point.
        app: './src/index.ts',

        // This is the entry point for the AUX VM.
        // AUX uses a sandboxed iframe along with a web worker
        // to provide performance and isolation from
        // the main thread. This is what allows
        // multiple simulations to be running at the same time.
        vm: path.resolve(
            __dirname,
            'node_modules',
            '@casual-simulation',
            'aux-vm-browser',
            'html',
            'IframeEntry.js'
        ),
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        // Rules for TypeScript
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    plugins: [
        new CleanWebpackPlugin(),

        // Here, we use the HtmlWebpackPlugin to generate
        // the output HTML that gets served to the web browsers.
        // We have one for our UI and one for the AUX VM.
        new HtmlWebpackPlugin({
            // Specify that we only want the "app" chunk
            // included in the output HTML
            chunks: ['app'],
            template: path.resolve(__dirname, 'src', 'index.html'),
        }),
        new HtmlWebpackPlugin({
            // Specify that we only want the "vm" chunk included
            // in the output HTML.
            chunks: ['vm'],

            title: 'AUX VM',

            // The AUX VM will load a file named
            // aux-vm-iframe.html
            filename: 'aux-vm-iframe.html',
        }),
    ],
};
