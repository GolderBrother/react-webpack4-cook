/*
 * @Title: 静态公共资源打包配置 
 * @Author: james.zhang 
 * @Date: 2019-06-15 11:57:17 
 * @Last Modified by: james.zhang
 * @Last Modified time: 2019-06-15 12:13:45
 * @Description: 项目中引入了很多第三方库，这些库在很长的一段时间内，基本不会更新，打包的时候分开打包来提升打包速度，而DllPlugin动态链接库插件，其原理就是把网页依赖的基础模块抽离出来打包到dll文件中，当需要导入的模块存在于某个dll中时，这个模块不再被打包，而是去dll中获取。
 */

const path = require('path');
const webpack = require('webpack');
const src = path.resolve(process.cwd(), 'src'); // 源码目录
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'; // 当前环境

module.exports = {
    mode: "production",
    entry: {
        // 定义程序中打包公共文件的入口文件
        jquery: ['jquery']
    },
    output: {
        path: path.resolve(__dirname, '..', 'dll'),
        filename: '[name].dll.js',
        library: '[name]_[hash]',
        libraryTarget: 'this'
    },
    plugins: [
        new webpack.DllPlugin({
            // 定义程序中打包公共文件的入口文件vendor.js
            context: process.cwd(),
            
            // manifest.json文件的输出位置
            path: path.resolve(__dirname, '..', 'dll/[name]-manifest.json'),
            
            // 定义打包的公共vendor文件对外暴露的文件名
            name: '[name]_[hash]'
        })
    ]
}