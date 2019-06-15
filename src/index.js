// 页面刷新后，数字重新变为0，我们想要的是，能不能把页面的状态保存了，也就是更改了代码后，页面还是保存了数字为6的状态，也就是实现局部更改，
import React from 'react';
import ReactDOM from "react-dom";
// react-hot-loader记录react页面留存状态state
// -------------------1、首先引入AppContainre
// webpack-dev-server 的热加载是开发人员修改了代码，代码经过打包，重新刷新了整个页面。而 react-hot-loader 不会刷新整个页面，它只替换了修改的代码，做到了页面的局部刷新。但它需要依赖 webpack 的 HotModuleReplacement 热加载插件。
// https://blog.csdn.net/huangpb123/article/details/78556652
import { AppContainer } from "react-hot-loader";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

import $ from 'jquery';
import { add } from './math';

add(666);

/*初始化*/
// -------------------2、初始化
renderWithHotReload(Router);

/* 热更新 */
// -------------------3、热更新操作
if(module.hot) {
    module.hot.accept('./router/index.js', () => {
        const Router = require('./router/index.js').default;
        renderWithHotReload(Router);
    });
}

$(function(){
   console.log('james,测试jquery是否可用', $, $(".primary-layout").width()); 
});

// -------------------4、定义渲染函数
function renderWithHotReload(Router) {
    ReactDOM.render(
        <AppContainer>
            <BrowserRouter>
                <Router />
            </BrowserRouter>
        </AppContainer>,
        document.getElementById("root")
    );
}

// 判断该浏览器支不支持 serviceWorker
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('service worker regist: ', registration);
        }).catch(error => {
            console.log('service worker regist error: ', error);
        })
    });
}
