export const add = a => {
    console.log(a + 7);
}

// 没用到的函数会被js shaking去除掉
export const sub = a => {
    console.log(a - 7);
}