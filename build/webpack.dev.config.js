/*
 * @Description: 开发环境下的webpack额外配置 
 * @Author: james.zhang 
 * @Date: 2019-06-15 15:51:34 
 * @Last Modified by: james.zhang
 * @Last Modified time: 2019-06-15 16:31:15
 */

const path = require('path');
const webpack = require('webpack');
const commonConfig = require('./webpack.base.config');
const merge = require('webpack-merge');


module.exports = merge(commonConfig, {
    mode: "development",
    devtool: "cheap-module-eval-source-map", // 开发环境配置
    output: {
        // 输出目录
        path: path.resolve(__dirname, '..', 'dist'),
        // 文件名称
        filename: 'bundle.js',
        chunkFilename: '[name].js'
    },
    plugins: [
        //开启HMR(热替换功能,替换更新部分,不重载页面！) 相当于在命令行加 --hot
        new webpack.HotModuleReplacementPlugin(),
        // 指定环境，定义环境变量
        new webpack.DefinePlugin({
            'process.env': {
                VUEP_BASE_URL: '/'
            }
        }),
    ],
    // 开发服务器配置
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, './dist'),
        // host: '0.0.0.0',  // 可以使用手机访问
        host: 'localhost',
        port: 8080,
        historyApiFallback: true, // 该选项的作用所有的404都连接到index.html
        proxy: {
            // 代理到后端的服务地址，会拦截所有以api开头的请求地址
            "^api": "http://localhost:3000"
        }
    },
})