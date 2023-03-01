const browserObject = require('../browser');
const scraperObject = require('./scraper');
const { slackLog } = require('../utils');
const { WEBSITE_DOMAIN } = require('./config');

(async () => {
    
    let browser = await browserObject.startBrowser();

    if(browser != null)
    {
        await Promise.all([
            scraperObject.scraper(browser, 'https://homedy.com/ban-nha-dat/p1'),
            scraperObject.scraper(browser, 'https://homedy.com/cho-thue-nha-dat/p1'),
            scraperObject.scraper(browser, 'https://homedy.com/ban-can-ho-chung-cu/p1'),
        ]);

        console.log('Đóng trình duyệt...');

        await browser.close();

        await slackLog(`${WEBSITE_DOMAIN} => Đóng trình duyệt`);
    }

})().catch(error => {
    console.error(`Không thể tạo phiên bản trình duyệt => ${error}\n`);
});