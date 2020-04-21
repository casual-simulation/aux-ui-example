const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './src/index.ts',
        vm: path.resolve(
            __dirname,
            'node_modules',
            '@casual-simulation',
            'aux-vm-browser',
            'html',
            'IframeEntry.js'
        ),
    },
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
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
    devServer: {
        contentBase: './dist',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['app'],
            template: path.resolve(__dirname, 'src', 'index.html'),
        }),
        new HtmlWebpackPlugin({
            chunks: ['vm'],
            // inject: false,
            // template: path.resolve(
            //     __dirname,
            //     'node_modules',
            //     '@casual-simulation',
            //     'aux-vm-browser',
            //     'html',
            //     'iframe_host.html'
            // ),
            title: 'AUX VM',
            filename: 'aux-vm-iframe.html',
        }),
    ],
};
