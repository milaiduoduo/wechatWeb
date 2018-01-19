const path = require('path');
let util = require('./libs/util');
let wechat_file = path.join(__dirname,'./config/wechat.txt');
let config = {
    wechat:{
        appID:'wx2bda83f75086e961',
        appSecret:'ee6d13d929cd0caf54316bca45809f29',
        token:'xingmaxiaobao',
        getAccessToken:function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken:function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file,data);
        }
    }
}

module.exports = config;