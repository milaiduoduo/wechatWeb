'use strict';
const sha1 = require('sha1');
const request = require('request');
const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: `${prefix}token?grant_type=client_credential`
}
function Wechat(opts) {
    var that = this;
    console.log('this:', this);
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getAccessToken().then(function (data) {
        if (that.isValidAccessToken(data)) {
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;
        }
        else {
            return that.updateAccessToken();
        }
    }).then(function(data){
        // 是updataAccessToken的回调
        that.access_token = data.access_token;
        that.expires_in = data.expires_in;
        that.saveAccessToken(data);
    }).catch(function (e) {
        console.log('err in getAccessToken!!!!!:', e);
    })
}

Wechat.prototype.isValidAccessToken = function (data) {
    try {
        data = JSON.parse(data);
    }
    catch (e) {
        return false;
    }
    if (!data || !data.access_token || !data.expires_in) {
        return false;
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());
    console.log('now: ', now, '----', new Date());
    if (now < expires_in) return true;
    return false;
}

Wechat.prototype.updateAccessToken = function () {
    let url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
    console.log('url:::',url);
    return new Promise(function (resolve, reject) {
        request.get({url: url, json: true}, function (error, response, body) {
            let data = body;
            let now = (new Date().getTime());
            let expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;
            resolve(data);
        })
    })
}

module.exports = function (opts) {
    var wechat = new Wechat(opts);
    return function*(next) {
        console.log(this.query);
        this.body = 'hi,wechat!';
        /*第一步身份验证*/
        // 需要配合的工作有：
        // 1、登录 微信公众平台：https://mp.weixin.qq.com，点击进入“开发者工具”，点击进入“公众平台测试账号”，配置url项目和token项目。
        // 2、如何让自己的node.js服务暴露到外网？
        //    使用localtunnel服务，做内网穿透。在命令行模式下，安装localtunnel包。步骤如下：
        //    a. npm i -g localtunnel
        //    b. lt --port 8080
        //       或者 自己指定子域名，使用命令：lt --subdomain myName --port 8080 或 lt -s klioen -p 8080
        // 3、将lt --subdomain myName --port 8080 产生的域名配置到公众平台测试账号中：https://myName.coffeeman.localtunnel.me/
        //    可以先访问这个生成的网址，看是否能成功访问，若页面显示内容跟你本地node.js server显示内容一样则说明，内网穿透成功。否则失败。
        //    localtunnel服务不是很稳定，很多时候都需要多次尝试后才能成功。成功后，进行下一步。
        // 4、公众平台测试账号中的token可自行设置。
        // 5、点击提交，若页面提示“配置成功”，则node.js server 会收到微信服务器发来的JSON字符串，如下：。
        // { signature: '3117e068b8e5e2d8908a9ee2ff0e169893e23999',
        //     echostr: '3881349449179261692',
        //     timestamp: '1515760348',
        //     nonce: '1124498352' }
        let token = opts.token;
        let signature = this.query.signature;
        let nonce = this.query.nonce;
        let timestamp = this.query.timestamp;
        let echostr = this.query.echostr;
        let str = [token, timestamp, nonce].sort().join('');
        let sha = sha1(str);
        if (sha == signature) {
            this.body = echostr + '';
        } else {
            this.body = 'not the right server.'
        }
    }
}