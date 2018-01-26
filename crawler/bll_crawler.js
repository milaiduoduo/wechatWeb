let cheerio = require('cheerio');
function filterCrawlerDataByRegion(html) {
    let $ = cheerio.load(html);
    let houses = $('.sellListContent').find('.new.tagBlock').closest("li[class='clear']");
    // console.log('房子有：',houses);
    let houseList = new Array();
    houses.each(function (item) {
        let house = $(this);
        let title = house.find('.address>.houseInfo').text();
        let houseUrlTemp = house.find('.title>a')
        let houseDetail = houseUrlTemp.text();
        let houseUrl = houseUrlTemp.attr('href');
        let houseId = houseUrlTemp.attr('data-housecode');
        let ImgUrl = house.find('.img>img').attr('data-original');

        let priceTemp = house.find('.totalPrice');
        let price = priceTemp.text();
        let unitPrice = house.find('.unitPrice>span').text();

        let buildingName = house.find('.houseInfo>a').text();
        let positonAndYear = house.find('.positionInfo').text();
        let starsInfo = house.find('.followInfo').text();
        let tagTemp = house.find('.tag');
        let subway = tagTemp.find('.subway').text();
        let fiveYear = tagTemp.find('.five').text();
        let hasKey = tagTemp.find('.haskey').text();
        let houseObj = {
            title,
            houseDetail,
            ImgUrl,
            houseUrl,
            price,
            unitPrice,
            buildingName,
            positonAndYear,
            starsInfo,
            subway,
            fiveYear,
            hasKey
        };
        houseList.push(houseObj);
    })
    return houseList;
}

function printHouseInfo(houseList) {
    // console.log('houseList:',houseList);
    let count = 0;
    houseList.forEach(function (house) {
        count++;
        // console.log(house);
        let info = '';
        for (let key in house) {
            info += house[key] + '\n';
        }
        console.log(count +":"+info);

    })
}

exports.filterCrawlerDataByRegion = filterCrawlerDataByRegion;
exports.printHouseInfo = printHouseInfo;










