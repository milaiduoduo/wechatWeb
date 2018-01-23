'use strict';

const fs = require('fs');
const request = require('request');
const util = require('./util');

const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: `${prefix}token?grant_type=client_credential`,
    uploadTempMaterialUrl:prefix+'media/upload?'
}
function Wechat(opts) {
    var that = this;
    console.log('this:', this);
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.fetchAccessToken();

}

Wechat.prototype.test = function(){
    this.fetchAccessToken().then(function(data){
        console.log('fetchAccessToken回调参数值：',data);
    });
}

Wechat.prototype.fetchAccessToken = function (data) {
    let that = this;
    let tokenVaildFlag = false;
    console.log('this.access_token && this.expires_in:',this.access_token, this.expires_in);
    if(this.access_token && this.expires_in){
        if(this.isvalidAccessToken(this)){
            console.log('提前验证成功，返回Promise.resolve(this)');
            return Promise.resolve(this);
        }
    }

    return this.getAccessToken().then(function (data) {
        tokenVaildFlag = that.isValidAccessToken(data);
        if (tokenVaildFlag) {
            console.log('验证成功，只需要返回data！！！')
            return data;
        }
        else {
            console.log('验证失败，需要重新请求new token！！！')
            return that.updateAccessToken();
        }
    }).then(function (data) {
        // 是updataAccessToken的回调
        that.access_token = data.access_token;
        that.expires_in = data.expires_in;
        if (!tokenVaildFlag) {
            console.log('验证失败，重新保存token！！！')
            that.saveAccessToken(data);
        }
        console.log('最后会在这里返回，Promise.resolve(data)');
        return Promise.resolve(data);
    })
    // .catch(function (e) {
    //     console.log('err in getAccessToken!!!!!:', e);
    // })
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
    console.log('url:::', url);
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

Wechat.prototype.uploadTempMaterial = function(type,filepath){
    let that = this;
    let form = {
        media: fs.createReadStream(filepath)
    };
    console.log('in uploadTempMaterial 上传素材方法中,media！！！',form.media);
    return new Promise(function(resolve,reject){
       //console.log('that.fetchAccessToken()：：：：：：：：',that.fetchAccessToken());
        that.fetchAccessToken().then(function(data){
            let url = api.uploadTempMaterialUrl + 'access_token=' + data.access_token + '&type=' + type;
            request.post({url: url,form:form, json: true}, function (error, response, body) {
                let _data = body;
                if(!error){
                    if(_data){
                        console.log('post返回的结果是？:',body);
                        return Promise.resolve(_data);
                        //resolve(_data)
                    }
                    else{
                        return Promise.reject(error);
                        // throw new Error('upload temporary material failed!!!!')
                    }
                }
                return Promise.reject(error);


            })
            //     .catch(function(err){
            //     reject(err);
            // })
        })
    })
}

Wechat.prototype.reply = function () {
    var sendContent = this.body;
    var message = this.receivedMessage;


    var xml = util.tpl(sendContent, message);
    console.log('回复的xml:', xml);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
}

module.exports = Wechat;