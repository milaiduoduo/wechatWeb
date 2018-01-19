'use strict'
exports.reply = function* (next){
    console.log('in handler!!!!!!');
    var message = this.receivedMessage;
    if(message.MsgType === 'event'){
        if(message.Event === 'subscrbe'){
            if(message.EventKey){
                console.log(`扫二维码进来：${message.EventKey} ${message.ticket}`);
            }
            this.body = '哈哈，你订阅了这个号\r\n';
        }
        else if(message.Event === 'unsubscribe'){
            console.log('无情取关');
            this.body = '无情取关';
        }
    }
    else{

    }
    yield next;
}













