'use strict';

let Koa = require('koa');
let sha1 = require('sha1');
let wechat = require('./wechat/generator_1')
let app = new Koa();

let config = {
    wechat:{
        appID:'wx2bda83f75086e961',
        appSecret:'ee6d13d929cd0caf54316bca45809f29',
        token:'xingmaxiaobao'
    }
}

app.use(wechat(config.wechat));
app.listen(3002);
console.log('wechat server listening:3002.......')