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
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[sha1:hash:hex:4]'
                        }
                    }
                ]
            }
        ]
    }
}