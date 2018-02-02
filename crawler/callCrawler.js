let crawler = require('./crawler');
let bll_crawler = require('./bll_crawler');
let url = 'https://cd.lianjia.com/ershoufang/jinsha/co32/';
crawler.crawlerWeb(url).then((data)=>{

    try {
        let html = data;
        //console.log('爬到的数据是：', data);
        let hoursesList = bll_crawler.filterCrawlerDataByRegion(html);
        bll_crawler.printHouseInfo(hoursesList);
    }
    catch(e){
        console.log('my err:',e);
    }
})