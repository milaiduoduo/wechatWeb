'use strict';
const sha1 = require('sha1');
const getRowBody = require('raw-body');
const Wechat = require('./wechat');
const util = require('./util');

module.exports = function (opts) {
    var wechat = new Wechat(opts);
    return function*(next) {
        // console.log('this.query:：：：',this.query);
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
        let that = this;
        let token = opts.token;
        let signature = this.query.signature;
        let nonce = this.query.nonce;
        let timestamp = this.query.timestamp;
        let echostr = this.query.echostr;
        let str = [token, timestamp, nonce].sort().join('');
        let sha = sha1(str);
        console.log('method: ', this.method, typeof this.method);
        if (this.method === 'GET') {
            console.log('in Get------------------');
            if (sha != signature) {
                this.body = 'get:not the right server.'
            } else {
                this.body = echostr + '';
            }
        }
        else if (this.method === 'POST') {
            if (sha != signature) {
                this.body = 'post: not the right server.'
                return false;//???????????
            }
            //拿到xml数据
            let data = yield getRowBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })
            // console.log('xml data: ', data.toString());

            // xml数据转化成Json，使用xml2js模块，但它转化出来的JS的value是一个数组，所以还需要进一步转化。
            let content = yield util.parseXMLAsync(data);
            // console.log('content parse: ',content);

            // 测试用数据
            // var obj = `{ "xml":
            // { "ToUserName": [ "gh_4008fb0c9dd7",["10","20"],"ll" ],
            //     "FromUserName": [ "oy8In057SgEFn0qJWLvCfJABEkkU"],
            //     "CreateTime": [ "1516178799" ],
            //     "MsgType": [ "text" ],
            //     "Content": [ "k" ],
            //     "MsgId": [ "6511938357042227392" ] } }`;
            let message = util.formatMessage(content.xml);

            this.receivedMessage = message;

            console.log('receivedMessage:: ', message);

            //yield handler.call(this, next);//??????

            yield next.call(this);

            wechat.reply.call(this);
        }
    }
}








