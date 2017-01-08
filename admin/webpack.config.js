const path = require('path');

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, '/dist'),
    },

    devtoool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    },

    module: {
        loaders: [
            {
                test: /\.tsx$/,
                loader: 'awesome-typescript-loader',
            },
        ],

        preLoaders: [
            {
                test: /\.js$/, 
                loader: 'source-map-loader',
            },
        ],
    },

    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
};