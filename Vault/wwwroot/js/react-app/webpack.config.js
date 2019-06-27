const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractCSS = new ExtractTextPlugin('bundle.css');
var webpack = require('webpack');

module.exports = {
    context: __dirname, 
    entry: "./app/app.js",
    mode: "development",
    output: {
        path: __dirname + "/dist", 
        filename: "bundle.js",
        publicPath: './js/react-app/dist/'
    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                loader: 'url-loader?limit=true,100000'
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: extractCSS.extract([
                    {
                        loader: "css-loader",
                        options: {
                            modules: {//-[hash:base64:6]
                                
                                localIdentName: '[local]',
                                //localIdentName: '[hash:base64:6]',
                            },
                            url: false,
                            importLoaders: 2
                        }
                    }, 'postcss-loader'
                ])
            },
            {

                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: ["@babel/plugin-syntax-dynamic-import"],
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        extractCSS
    ]
}