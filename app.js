'use strict';

var Koa = require('koa');
var app = new Koa();
app.use(function* (next){
    console.log(this.query);
    this.body = 'hi,wechat!';
});
app.listen(2000);
console.log('wechat server listening:2000.......')