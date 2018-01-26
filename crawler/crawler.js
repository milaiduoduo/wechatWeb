let request = require('request');

//
function crawlerWeb(url) {
    console.log('in crawlerWeb');
    return new Promise(function (resolve, reject) {
        console.log('in Promise');
        let opt = {
            url: url,
            method: 'GET'
        }
        request(opt, function (err, response, body) {
            console.log('in request');
            var html = '';
            if(!err){
                try{
                    // body.on('data',function(data){
                    //     html += data;
                    // });
                    // body.on('end',function () {
                    //     resolve(html);
                    // })
                    if(response.statusCode == 200) {
                        resolve(body);
                    }
                }
                catch(e){
                    reject('err,爬取数据出错:',err);
                }

            }
            else{
                reject('err,爬取数据出错:',err);
            }

        }).on('error',function (e) {
            console.log('爬取数据出错！！')
            reject('err,爬取数据出错:',e)
        })
    })
}

exports.crawlerWeb = crawlerWeb;

















