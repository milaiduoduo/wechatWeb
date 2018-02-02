'use strict'
const tpl = require('./tpl');

let xml2js = require('xml2js');
function parseXMLAsync(xml) {
    return new Promise(function (resolve, reject) {
        xml2js.parseString(xml, {trim: true}, function (err, content) {
            if (err) reject(err)
            else resolve(content);
        })
    })
}

function formatMessage(result) {
    let message = {};
    if (typeof result === 'object') {
        var keys = Object.keys(result);
        for (var i = 0; i < keys.length; i++) {
            let key = keys[i];
            let itemValues = result[key];
            let tempArray = new Array();
            let returnArray = _formatArray(itemValues, tempArray, key);

            message[key] = returnArray.join();
        }
    }
    return message;
}

function _formatArray(itemValues, tempArray, key) {
    itemValues.forEach(function (item) {
        if (item instanceof Array) {
            _formatArray(item, tempArray);
        }
        else {
            tempArray.push(item);
        }
    })
    return tempArray;
}

exports.parseXMLAsync = parseXMLAsync;
exports.formatMessage = formatMessage;

exports.tpl = function (sendContent, receivedmessage) {
    let info = {};
    let type = 'text';
    let fromUserName = receivedmessage.FromUserName;
    let toUserName = receivedmessage.ToUserName;

    if (Array.isArray(sendContent)) {
        type = 'news';
    }

    type = sendContent.type || type;
    info.content = sendContent;
    info.createTime = new Date().getTime();
    info.msgType = type;
    info.toUserName = fromUserName;
    info.fromUserName = toUserName;

    console.log('returned info in util.js::', info);

    //使用ejs的compiled方法，第一次调用返回一个方法，第二次调用这个返回的方法，参数为要渲染页面的数据。
    //tpl.compiled(要渲染页面的数据)
    return tpl.compiled(info);
}











