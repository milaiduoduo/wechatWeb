'use strict'

const config = require('./config');
const Wechat = require('./wechat/wechat');
var wechatApi = new Wechat(config.wechat);

exports.setReplyContent = function*(next) {
    //console.log('in handler!!!!!!');
    var receivedMessage = this.receivedMessage;
    console.log('receivedMessage:::', receivedMessage);
    if (receivedMessage.MsgType === 'event') {
        switch (receivedMessage.Event) {
            case 'subscribe':
                if (receivedMessage.EventKey) {
                    console.log(`扫二维码进来：${receivedMessage.EventKey} ${receivedMessage.ticket}`);
                }
                this.body = '哈哈哈哈哈，终于等到你，我都等哭了!!!\r\n';
                break;
            case 'unsubscribe':
                console.log('无情取关');
                this.body = '无情取关';
                break;
            case 'LOCATION':
                this.body = `您上报的位置是：${receivedMessage.Latitude}/${receivedMessage.Longitude}-${receivedMessage.Precision}`;
                break;
            case 'CLICK':
                this.body = `您点击了菜单：${receivedMessage.EventKey}`;
                break;
            case 'SCAN':
                console.log(`关注后扫二维码：${receivedMessage.EventKey} ${receivedMessage.Ticket}`);
                this.body = '看到你扫了一下哦！';
                break;
            case 'VIEW':
                this.body = '您点击了菜单中的链接：' + receivedMessage.EventKey;
        }
    }
    else if (receivedMessage.MsgType === 'text') {
        let receivedContent = receivedMessage.Content;
        let reply = '';
        switch (receivedContent) {
            case '1':
                reply = '一只小马耍滑梯';
                break;
            case '2':
                reply = '三只小马爬雪山';
                break;
            case '3':
                // 回复图文列表，图片是使用的链接。
                reply = [{
                    title: 'Node.js的世界',
                    description: '只是个描述而已',
                    picUrl: 'https://gd4.alicdn.com/imgextra/i1/TB1GmEWPVXXXXbgaXXXYXGcGpXX_M2.SS2',
                    url: 'https://github.com/'
                }, {
                    title: 'koa2的世界',
                    description: '也只是个描述而已',
                    picUrl: 'http://ss.csdn.net/p?http://mmbiz.qpic.cn/mmbiz_png/Inx1Hb2kt6ZCDZX1zL0BZHiayA0aJDZWvSUd3k6vGUcFXE8AJiaDqeicWoAPu0HvaP3cxy9rm2UTEfv81CXK4PBZQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1',
                    url: 'https://www.baidu.com'
                }, {
                    title: '微信的世界',
                    description: '也只是个描述而已',
                    picUrl: 'http://pic137.nipic.com/file/20170801/23159666_200250564035_2.jpg',
                    url: 'https://www.baidu.com'
                }, {
                    title: 'Promise的世界',
                    description: '也只是个描述而已',
                    picUrl: 'http://pic111.nipic.com/file/20160929/24014891_091758419000_2.jpg',
                    url: 'https://www.baidu.com'
                }, {
                    title: 'Generator的世界',
                    description: '也只是个描述而已',
                    picUrl: 'http://pic128.nipic.com/file/20170504/25230470_161040886038_2.jpg',
                    url: 'https://www.baidu.com'
                }]
                break;
// 临时素材-------------------------------------------------------------------------
            case '11':
                // 临时图片上传并回复
                var data = yield wechatApi.uploadTempMaterial('image', __dirname + '/public/temp2.jpg')
                reply = {
                    type: 'image',
                    mediaId: data.media_id
                }
                // console.log('上传后的图片数据：',typeof data,'---------',data.media_id);
                console.log('回复的图片数据：', reply);
                break;
// 永久素材--------------------------------------------------------------------------
            case '21':
                // 永久图片上传并回复
                var data = yield wechatApi.uploadPermMaterial('image', __dirname + '/public/per1.jpg');
                reply = {
                    type: 'image',
                    mediaId: data.media_id
                }
                // console.log('上传后的图片数据：',typeof data,'---------',data.media_id);
                console.log('回复的永久图片数据：', reply);
                break;
            case '22':
                // 永久视频上传并回复
                // {type:'video',description:'{"title":"Really a nice place","introduction":"easy??"}'}
                var data = yield wechatApi.uploadPermMaterial('video', __dirname + '/public/perV1.mp4');
                reply = {
                    type: 'video',
                    title: '回复的永久视频',
                    description: '就是它！',
                    mediaId: data.media_id
                }
                // console.log('上传后的图片数据：',typeof data,'---------',data.media_id);
                console.log('回复的永久视频数据：', reply);
                break;
            case '23':
                // 永久语音上传并回复
                var data = yield wechatApi.uploadPermMaterial('voice', __dirname + '/public/per_M1.mp3');
                reply = {
                    type: 'voice',
                    mediaId: data.media_id
                }
                // console.log('上传后的图片数据：',typeof data,'---------',data.media_id);
                console.log('回复的永久语音数据：', reply);
                break;
            case '24':
                // 永久图文
                break;
            case '31':
                //获取永久素材数量
                var data = yield wechatApi.getMaterialCount();
                console.log('永久素材数量数据为：', data);
                //解决“引号乱码问题，在ejs中使用<%=替换<%-
                reply = JSON.stringify(data);
                break;
            case '32':
                //获取永久素材列表
                var data = yield wechatApi.getMaterialList('image');
                console.log('永久素材数据列表为：', data);
                //解决“引号乱码问题，在ejs中使用<%=替换<%-
                reply = JSON.stringify(data);
                break;
            default:
                reply = `额，你说的${receivedMessage.Content}太复杂了`;

        }
        this.body = reply;
    }
    // console.log('in reply this.body,next:',this.body,next);
    yield next;
}













