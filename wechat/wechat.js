'use strict';

const fs = require('fs');
const request = require('request');
const util = require('./util');

const prefix = 'https://api.weixin.qq.com/cgi-bin/';
const api = {
    accessToken: `${prefix}token?grant_type=client_credential`,
    uploadTempMaterialUrl: `${prefix}media/upload?`,
    permanent: {
        uploadPermNews: `${prefix}material/add_news?`,
        uploadPermPics: prefix + 'media/uploadimg?',
        uploadPermOther: prefix + 'material/add_material?',
        getPermMaterialCount: prefix+'material/get_materialcount?',
        getPermMaterial: prefix + 'material/get_material?',
        getPermMaterialList: prefix +'material/batchget_material?'
    }

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


Wechat.prototype.fetchAccessToken = function (data) {
    let that = this;
    let tokenVaildFlag = false;
    //console.log('this.access_token && this.expires_in:',this.access_token, this.expires_in);

    if (this.access_token && this.expires_in) {
        tokenVaildFlag = this.isValidAccessToken(this);
        //console.log('第一次验证tokent结果:',tokenVaildFlag);
        if (tokenVaildFlag) {
            //console.log('已有验证成功，返回Promise.resolve(this)');
            return Promise.resolve(this);
        }
    }

    // 执行new的时候
    return this.getAccessToken().then(function (data) {
        let _data = {};
        try {
            _data = JSON.parse(data);
        }
        catch (e) {
            // console.log('JSON化失败，需要重新请求new token！！！')
            return that.updateAccessToken();
        }

        tokenVaildFlag = that.isValidAccessToken(_data);
        if (tokenVaildFlag) {
            console.log('token可用，不需要保存！！！', _data);
            return _data;
        }
        else {
            //console.log('验证失败，需要重新请求new token！！！')
            return that.updateAccessToken();
        }
    }).then(function (_data) {
        // 是updataAccessToken的回调
        that.access_token = _data.access_token;
        that.expires_in = _data.expires_in;
        if (!tokenVaildFlag) {
            //console.log('验证失败时，重新保存token！！！')
            that.saveAccessToken(_data);
        }
        // console.log('最后会在这里返回，Promise.resolve(_data),_data:', _data.access_token, _data.expires_in);
        console.log('成功取得或保存了token!!')
        return Promise.resolve(_data);
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

Wechat.prototype.uploadTempMaterial = function (type, filepath) {
    let that = this;
    let form = {
        media: fs.createReadStream(filepath)
    };
    return new Promise(function (resolve, reject) {
        that.fetchAccessToken().then(function (data) {
            let url = api.uploadTempMaterialUrl + 'access_token=' + data.access_token + '&type=' + type;
            request.post({url: url, formData: form}, function optionalCallback(err, httpResponse, body) {
                let _data = JSON.parse(body);
                if (!err) {
                    if (_data) {
                        // console.log('post返回的结果是？:', typeof body);//string
                        resolve(_data)
                    }
                    else {
                        reject(err);
                        // throw new Error('upload temporary material failed!!!!')
                    }
                }
                reject(err);
            });
            // Promise.resolve(request.post({url: url, formData: form}, function optionalCallback(err, httpResponse, body) {
            //     let _data = JSON.parse(body);
            //     if (!err) {
            //         if (_data) {
            //             // console.log('post返回的结果是？:', typeof body);//string
            //             resolve(_data)
            //         }
            //         else {
            //             reject(err);
            //             // throw new Error('upload temporary material failed!!!!')
            //         }
            //     }
            //
            //     reject(err);
            // }))

        })
    })
}

Wechat.prototype.uploadPermMaterial = function (type, material) {
    let that = this;
    let form = {};
    // permanent
    let uploadUrl = '';

    if (type === 'news') {
        uploadUrl = api.permanent.uploadPermNews;
        form = material
    } else {
        if (type == 'picInnews') uploadUrl = api.permanent.uploadPermPics;
        else uploadUrl = api.permanent.uploadPermOther;
        form.media = fs.createReadStream(material);
    }

    return new Promise(function (resolve, reject) {
        that.fetchAccessToken().then(function (data) {
            let url = `${uploadUrl}access_token=${data.access_token}`;
            if(type!='news' && type!='picInnews') url += `&type=${type}`;
            console.log('进入uploadPerMaterial,data:', data);
            console.log('进入uploadPerMaterial,url:', url);

            let opts = {
                method: 'POST',
                url: url,
                json: true
            }
            if (type === 'news') {
                opts.body = form;
            }
            else {
                opts.formData = form;
            }
            request(opts, function (err, response, body) {
                let _data = body;
                console.log('收到的永久数据回复是：',body);
                if (!err) {
                    if (_data) {
                        resolve(_data);
                    }
                    else {
                        reject(err);
                    }
                }
                else{
                    reject(err);
                }
            })
        })
    })

}

Wechat.prototype.getMaterialCount = function(){
    let that = this;
    return new Promise(function (resolve, reject) {
        that.fetchAccessToken().then(function (data) {
            let url = api.permanent.getPermMaterialCount + 'access_token=' + data.access_token ;
            console.log('获取素材的url:',url);
            request.get({url: url, json:true}, function optionalCallback(err, httpResponse, body) {
                let _data = body;
                if (!err) {
                    if (_data) {
                        // console.log('post返回的结果是？:', typeof body);//string
                        resolve(_data)
                    }
                    else {
                        reject(err);
                        // throw new Error('upload temporary material failed!!!!')
                    }
                }
                reject(err);
            });
        })
    })
}

Wechat.prototype.getMaterialList = function(type){
    let that = this;
    return new Promise(function(resolve,reject){
        that.fetchAccessToken().then(function (data){
          let url = api.permanent.getPermMaterialList + 'access_token=' + data.access_token ;
          console.log('获取素材list的url',url);
          let form = {
              "type":"image",
              "offset":"0",
              "count":"1"
          };
            let opts = {
                method: 'POST',
                url: url,
                json: true,
                body:form
            }
          console.log('typeof form:',typeof form);
          console.log('获取素材list传递的参数：',form);
          request.post({url:url,body:form,json:true},function(err,httpResponse,body){
          // request(opts,function(err,httpResponse,body){
              let _data = body;
              if(!err){
                  if(_data){
                      resolve(_data);
                  }
                  else{
                      reject(err);
                  }
              }
              else{
                  reject(err);
              }
          })

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











