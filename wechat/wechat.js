'use strict';

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
            return data;
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

module.exports = Wechat;