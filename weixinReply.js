'use strict'
exports.reply = function* (next){
    console.log('in handler!!!!!!');
    var message = this.receivedMessage;
    console.log('receivedMessage:::',message);
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            if(message.EventKey){
                console.log(`扫二维码进来：${message.EventKey} ${message.ticket}`);
            }
            this.body = '哈哈哈哈哈，终于等到你，等你我都等哭了~~好鸡冻！！\r\n';
        }
        else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
            this.body = '无情取关';
        }
    }
    else{

    }
    // console.log('in reply this.body,next:',this.body,next);
    yield next;
}












