'use strict'
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