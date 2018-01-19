'use strict';

let Koa = require('koa');
const path = require('path');
let sha1 = require('sha1');
let my_generator = require('./wechat/generator_1');
let config = require('./config');
let weixin_logic = require('./bll_weixin');
console.log('weixin_logic::::::',weixin_logic);
let app = new Koa();


app.use(my_generator(config.wechat,weixin_logic.setReplyContent)); //handler
app.listen(2003);
console.log('wechat server listening:2003.......')