const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractCSS = new ExtractTextPlugin('bundle.css');

module.exports = {
    context: __dirname,
    entry: "./app/app.js",
    mode: "development",
    output: {
        path: __dirname, 
        filename: "bundle.js"
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
                            modules: {
                                localIdentName: '[local]-[hash:base64:6]',
                            },
                            
                            importLoaders: 1
                        }
                    }
                ])
            },
            {

                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            }
        ]
    },
    plugins: [
        extractCSS
    ]
}