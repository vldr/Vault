const ExtractTextPlugin = require("extract-text-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const extractCSS = new ExtractTextPlugin("/../css/[name].css", {
    allChunks: true
});

var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: {
        app: "./app/app/app.js",
        login: "./app/login/login.js",
        share: "./app/share/share.js"
    },
	mode: "production",
    output: {
        path: __dirname + "/../wwwroot/js/", 
        filename: "[name].js",
		chunkFilename: '[chunkhash].js',
        publicPath: './js/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: extractCSS.extract([
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                localIdentName: '[hash:base64:6]',
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