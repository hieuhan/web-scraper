const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const userAgent = new UserAgent({ deviceCategory: 'desktop' });
const { sleep, slackLog, dateToISOString } = require('../utils');
const { SITE_ID } = require('./config');
const 
{ 
    actionTypes, 
    provinces, 
    districts, 
    wards, 
    streets, 
    categories, 
    customers, 
    products, 
    scraperLogs 
} = require('../database/models');

const scraperObject = {
    async scraper (browser, pageUrl) {
        try {

            const page = await this.newPage(browser);

            if(page != null)
            {
                console.log(`Truy cập danh sách bài đăng =>\n${pageUrl}\n`);

                await scraperLogs.create({
                    SiteId: SITE_ID,
                    Path: pageUrl
                });

                let responseStatus; 

                responseStatus = await this.pageGoto(page, pageUrl);

                if(responseStatus && responseStatus == 200)
                {
                    const scrapeCurrentPage = async (pageUrl) => {

                        console.log(`Thu thập url bài đăng =>\n${pageUrl}\n`);
        
                        const urlsToCrawl = await page.$$eval('.product-item-top > a', entries => entries.map(a => a.href));
                        
                        const pagePromise = (productUrl) => new Promise( async (resolve, reject) => {
                            
                            try {
        
                                const newPage = await this.newPage(browser);
        
                                if(newPage != null)
                                {
                                    console.log(`Truy cập bài đăng =>\n${productUrl}\n`);
        
                                    let responseStatus; 
        
                                    responseStatus = await this.pageGoto(newPage, productUrl);
        
                                    if(responseStatus && responseStatus == 200)
                                    {
                                        const pageHtml = await newPage.content();
        
                                        const $ = cheerio.load(pageHtml);
        
                                        await parserData($, pageUrl, productUrl);

                                        await this.pageClose(newPage, productUrl);
        
                                        resolve(true);
                                    }
                                    else
                                    {
                                        console.log(`pagePromise =>\n${pageUrl}\n${productUrl}\nstatus code => ${responseStatus}`);

                                        await slackLog(`${pageUrl}\n${productUrl}\n=> Status code:  ${responseStatus}\n`);

                                        reject(false);
                                    }
                                }
                                else
                                {
                                    reject(false);
                                }
        
                            } catch (error) {
        
                                reject(false);
        
                                console.log(`pagePromise => ${error.name} - ${error.message} - ${error.stack}`);
                            }

                            await sleep();
                        });
        
                        if(!Array.isArray(urlsToCrawl) || urlsToCrawl.length === 0)
                        {
                            await sleep();
                        }
                        else
                        {
                            for(index in urlsToCrawl)
                            {
                                await pagePromise(urlsToCrawl[index]);
                            }
                        }

                        //link phan trang
                        let nextUrl = await page.$eval('.page-nav a[rel="next"]', (el) => el.href);

                        let nextButtonExist = false;

                        if(nextUrl && nextUrl.length > 0)
                        {
                            nextButtonExist = true;
                        }

                        if(nextButtonExist)
                        {
                            console.log(`Truy cập danh sách bài đăng =>\n${nextUrl}\n`);

                            await scraperLogs.create({
                                SiteId: SITE_ID,
                                Path: nextUrl
                            });

                            await this.pageGoto(page, nextUrl);

                            //await slackLog(nextUrl);

                            return scrapeCurrentPage(nextUrl);
                        }

                        //đóng page
                        await this.pageClose(page, pageUrl);

                    }
        
                    const parserData = async ($, pageUrl, productUrl) => {
                        try {
        
                            let districtId = 0 , wardId = 0, streetId = 0, productId = 0;
        
                            let [actionTypeId, apartmentTypeId, provinceId, customerId] = await Promise.all([
                                parserActionType($, pageUrl, productUrl),
                                parserApartmentType($, pageUrl, productUrl),
                                parserProvince($, pageUrl, productUrl),
                                parserCustomer($, pageUrl, productUrl)
                            ]);
                            provinceId = 1;
                            if(provinceId > 0)
                            {
                                districtId = await parserDistrict($, provinceId, pageUrl, productUrl);
                                districtId = 1;
                                if(districtId > 0)
                                {
                                    wardId = await parserWards($, provinceId, districtId, pageUrl, productUrl);
                                    wardId = 1;
                                    if(wardId > 0)
                                    {
                                        streetId = await parserStreet($, provinceId, districtId, wardId, pageUrl, productUrl);
                                    }
                                }

                                productId = await parserProduct($, actionTypeId, apartmentTypeId, provinceId, (districtId || 0), (wardId || 0), (streetId || 0), customerId, pageUrl, productUrl);
                            }

                            await sleep();
        
                        } catch (error) {
                            console.log(`parserData => ${error.name} - ${error.message} - ${error.stack}`);
                        }
                    }
        
                    const parserActionType = async ($, pageUrl, productUrl) =>
                    {
                        let actionTypeId = 0;
                        try 
                        {
                            let breadcrumbElement = $('.breadcrumb').first();
        
                            if(breadcrumbElement.length > 0)
                            {
                                let breadcrumbs = breadcrumbElement.text().trim().replace(/\r/g, '').split(/\n/).filter(function(v){return v!==''});
        
                                if(breadcrumbs.length > 1)
                                {
                                    const actionTypeName = breadcrumbs[1].trim();
        
                                    if(actionTypeName.length > 0)
                                    {
                                        const actionType = 
                                        {
                                            SiteId: SITE_ID,
                                            Name: actionTypeName.replace('Mua bán nhà đất', 'Bán').replace('Cho thuê nhà đất', 'Cho thuê').replace('Cho thuê Nhà đất', 'Cho thuê')
                                        }
        
                                        console.log(actionType)
        
                                        //actionTypeId = await actionTypes.create(actionType);
                                    }
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserActionType =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }
        
                        return actionTypeId;
                    }
        
                    const parserApartmentType = async ($, pageUrl, productUrl) =>
                    {
                        let apartmentTypeId = null;
                        try 
                        {
        
                            let breadcrumbElement = $('.breadcrumb').first();
    
                            if(breadcrumbElement.length > 0)
                            {
                                let breadcrumbs = breadcrumbElement.text().trim().split(/\n/).filter(function(v){return v!==''});
                                
                                if(breadcrumbs.length > 2)
                                {
                                    let apartmentTypeName = breadcrumbs[2].trim();
        
                                    if(apartmentTypeName.length > 0)
                                    {
                                        apartmentTypeName = apartmentTypeName.replace('Mua bán', '').replace('Cho thuê', '').trim();
        
                                        let apartmentType = {
                                            SiteId: SITE_ID,
                                            Name: apartmentTypeName
                                        }
        
                                        console.log(apartmentType);
                                        //apartmentTypeId = await database.landTypeInsert(apartmentType);
                                    }
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserApartmentType =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }
        
                        return apartmentTypeId;
                    }
        
                    const parserProvince = async ($, pageUrl, productUrl) =>
                    {
                        let provinceId = 0;
                        try 
                        {
                            let breadcrumbElement = $('.breadcrumb').first();
        
                            if(breadcrumbElement.length > 0)
                            {
                                let breadcrumbs = breadcrumbElement.text().trim().replace(/\r/g, '').split(/\n/).filter(function(v){return v!==''});
        
                                if(breadcrumbs.length > 3)
                                {
                                    const provinceName = breadcrumbs[3].trim();
        
                                    if(provinceName.length > 0)
                                    {
                                        const province = 
                                        {
                                            SiteId: SITE_ID,
                                            Name: provinceName
                                        }
        
                                        console.log(province);
                                        //provinceId = await database.provinceInsert(province);
                                    }
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserProvince =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }
        
                        return provinceId;
                    }

                    const parserDistrict = async ($, provinceId, pageUrl, productUrl) =>
                    {
                        let districtId = 0;
                        try 
                        {
                            let addressElement = $('.address').first();

                            if(addressElement.length > 0)
                            {
                                const address = addressElement.text().trim().split(' - ');

                                if(provinceId > 0 && address.length > 0)
                                {
                                    let districtName = '';

                                    const addressSplit = address[1].split(',').filter(function(v){return v!==''});

                                    if(addressSplit.length > 0)
                                    {
                                        for(var index in addressSplit)
                                        {
                                            if(addressSplit[index].trim().startsWith('Thành phố') || addressSplit[index].trim().startsWith('Quận') || addressSplit[index].trim().startsWith('Huyện'))
                                            {
                                                districtName = addressSplit[index];
                                                break;
                                            }
                                        }
                                    }

                                    if(districtName.length > 0)
                                    {
                                        const district = 
                                        {
                                            SiteId: SITE_ID,
                                            ProvinceId: provinceId,
                                            Name: districtName.replace('Quận', '').replace('Huyện', '').trim()
                                        }
        
                                        console.log(district)
                                        //districtId = await districts.create(district);
                                    }
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserDistrict =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }

                        return districtId;
                    }

                    const parserWards = async ($, provinceId, districtId, pageUrl, productUrl) =>
                    {
                        let wardsId = 0;
                        try 
                        {
                            let addressElement = $('.address').first();

                            if(addressElement.length > 0)
                            {
                                let address = addressElement.text().trim().split(' - ');

                                if(provinceId > 0 && districtId > 0 && address.length > 0)
                                {
                                    let wardsName = '';

                                    const addressSplit = address[1].split(',').filter(function(v){return v!==''});

                                    if(addressSplit.length > 0)
                                    {
                                        for(var index in addressSplit)
                                        {
                                            if(addressSplit[index].trim().startsWith('Phường') || addressSplit[index].trim().startsWith('Xã') || addressSplit[index].trim().startsWith('Thị trấn') || addressSplit[index].trim().startsWith('thị trấn'))
                                            {
                                                wardsName = addressSplit[index];
                                                break;
                                            }
                                        }
                                    }

                                    if(wardsName.length > 0)
                                    {
                                        const wards = 
                                        {
                                            SiteId: SITE_ID,
                                            ProvinceId: provinceId,
                                            DistrictId: districtId,
                                            Name: wardsName.replace('Phường', '').replace('Xã', '').replace('Thị trấn', '').replace('thị trấn', '').trim()
                                        }

                                        console.log(wards);
                                        //wardsId = await wards.create(wards);
                                    }
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserWards =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }

                        return wardsId;
                    }

                    const parserStreet = async ($, provinceId, districtId, wardId, pageUrl, productUrl) =>
                    {
                        let streetId = 0;
                        try 
                        {
                            let addressElement = $('.address').first();

                            if(addressElement.length > 0)
                            {
                                let address = [], addressTitle = '';

                                const addressLinkElement = addressElement.find('a').first();

                                if(addressLinkElement.length > 0)
                                {
                                    addressTitle = (addressLinkElement.attr('title') || '');

                                    if(addressTitle.indexOf('tại') != -1 && (addressTitle.indexOf('Đường') != -1 || addressTitle.indexOf('Phố') != -1))
                                    {
                                        address = addressTitle.trim().split('tại');
                                    }
                                    else
                                    {
                                        address = addressElement.text().trim().split(' - ');
                                    }
                                }

                                if(provinceId > 0 && districtId > 0 && address.length > 0)
                                {
                                    let streetName = '';

                                    const addressSplit = address[1].split(',').filter(function(v){return v!==''});

                                    if(addressSplit.length > 0)
                                    {
                                        for(var index in addressSplit)
                                        {
                                            if(addressSplit[index].trim().startsWith('Đường') || addressSplit[index].trim().startsWith('Phố'))
                                            {
                                                streetName = addressSplit[index];
                                                break;
                                            }
                                        }
                                    }

                                    if(streetName.length > 0)
                                    {
                                        const street = {
                                            SiteId: SITE_ID,
                                            ProvinceId: provinceId,
                                            DistrictId: districtId,
                                            WardId: wardId,
                                            Name: streetName.replace('Đường', '').replace('Phố', '').trim()
                                        }

                                        console.log(street);
                                        //streetId = await streets.create(street);
                                    }
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserStreet =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }

                        return streetId;
                    }
        
                    const parserCustomer = async ($, pageUrl, productUrl) =>
                    {
                        let customerId = 0;
                        try 
                        {
                            const agentElement = $('.agent-inpage').first();
                            
                            if(agentElement.length > 0)
                            {
                                let fullName = '', phoneNumber = '', email = null, avatar = null;
        
                                const agencyNameElement = agentElement.find('.flex-name h3').first();
        
                                if(agencyNameElement.length > 0)
                                {
                                    fullName = agencyNameElement.text().trim();
                                }
        
                                const phoneElement = agentElement.find('.mobile-box').first();
        
                                if(phoneElement.length > 0)
                                {
                                    phoneNumber = (phoneElement.attr('data-mobile') || '').trim();
                                }
        
                                const avatarElement = agentElement.find('.thumb  img').first();
                                
                                if(avatarElement.length > 0)
                                {
                                    avatar = (avatarElement.attr('src') || '').trim();
                                }
        
                                let customer = {
                                    SiteId: SITE_ID,
                                    FullName: fullName,
                                    PhoneNumber: phoneNumber,
                                    Email: email,
                                    Avatar: avatar
                                }
        
                                console.log(customer);
                                //customerId = await database.customerInsert(customer);
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserCustomer =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }
        
                        return customerId;
                    }

                    const parserProduct = async ($, actionTypeId, landTypeId, provinceId, districtId, wardId, streetId, customerId, pageUrl, productUrl) =>
                    {
                        let productId = 0;
                        try 
                        {
                            const productContentElement = $('.product .content').first();
                            
                            if(productContentElement.length > 0)
                            {
                                let title = '', breadcrumb = '', address = '', productCode = 0, projectId = null,
                                    publishedAt = null, expirationAt = null, verified = 0, isVideo = 0;

                                const breadcrumbElement = productContentElement.find('.breadcrumb').first();

                                if(breadcrumbElement.length > 0)
                                {
                                    let breadcrumbs = breadcrumbElement.text().trim().replace(/\r/g, '').split(/\n/).filter(function(v){return v.trim() !==''});

                                    if(breadcrumbs.length > 0)
                                    {
                                        breadcrumb = breadcrumbs.join('/');
                                    }
                                }

                                const addressElement = productContentElement.find('.address').first();

                                if(addressElement.length > 0)
                                {
                                    let addressArray = [], addressTitle = '';

                                    const addressLinkElement = addressElement.find('a').first();

                                    if(addressLinkElement.length > 0)
                                    {
                                        addressTitle = (addressLinkElement.attr('title') || '');

                                        if(addressTitle.indexOf('tại') != -1 && (addressTitle.indexOf('Đường') != -1 || addressTitle.indexOf('Phố') != -1))
                                        {
                                            addressArray = addressTitle.trim().split('tại');
                                        }
                                        else
                                        {
                                            addressArray = addressElement.text().trim().split(' - ');
                                        }
                                    }

                                    if(addressArray.length > 0)
                                    {
                                        address = addressArray.join(', ');
                                    }
                                }

                                const productTitleElement = productContentElement.find('h1').first();

                                if(productTitleElement.length > 0)
                                {
                                    title = productTitleElement.text().trim();
                                }

                                const productInfoElement = productContentElement.find('.product-info').first();

                                if(productInfoElement.length > 0)
                                {
                                    //ngày đăng
                                    const shortInfoItemFirstElement = productInfoElement.find('.lb-code:contains("Ngày đăng")').first();

                                    if(shortInfoItemFirstElement.length > 0)
                                    {
                                        const shortInfoItemFirstNextElement = shortInfoItemFirstElement.next();

                                        if(shortInfoItemFirstNextElement.length > 0)
                                        {
                                            const publishedAtSplit = shortInfoItemFirstNextElement.text().trim().split('/');

                                            if(publishedAtSplit.length == 3)
                                            {
                                                const [ publishedAtError, publishedAtData] = dateToISOString(publishedAtSplit[0] , publishedAtSplit[1], publishedAtSplit[2]);
                                                
                                                if(publishedAtError)
                                                {
                                                    //await scraperObject.scraperLog(`Bài đăng => ${title} => PublishedAt`, publishedAtError, pageUrl, productUrl);
                                                }
                                                else
                                                {
                                                    publishedAt = publishedAtData;
                                                }
                                            }
                                        }
                                    }

                                    //ngày hết hạn
                                    const shortInfoItemSecondElement = productInfoElement.find('.lb-code:contains("Ngày hết hạn")').first();

                                    if(shortInfoItemSecondElement.length > 0)
                                    {
                                        const shortInfoItemSecondNextElement = shortInfoItemSecondElement.next();

                                        if(shortInfoItemSecondNextElement.length > 0)
                                        {
                                            const expirationAtSplit = shortInfoItemSecondNextElement.text().trim().split('/');

                                            if(expirationAtSplit.length == 3)
                                            {
                                                const [ expirationAtError, expirationAtData] = dateToISOString(expirationAtSplit[0], expirationAtSplit[1], expirationAtSplit[2]);
    
                                                if(expirationAtError)
                                                {
                                                    //await scraperObject.scraperLog(`Bài đăng => ${title} => ExpirationAt`, expirationAtError, pageUrl, productUrl);
                                                }
                                                else 
                                                {
                                                    expirationAt = expirationAtData;
                                                }
                                            }
                                        }
                                    }

                                    //mã tin
                                    const shortInfoItemFourthElement = productInfoElement.find('.lb-code:contains("ID tin")').first();

                                    if(shortInfoItemFourthElement.length > 0)
                                    {
                                        const shortInfoItemFourthNextElement = shortInfoItemFourthElement.next();

                                        if(shortInfoItemFourthNextElement.length > 0)
                                        {
                                            try 
                                            {
                                                const shortInfoItemFourthElementClean = shortInfoItemFourthNextElement.text().replace(/[^0-9]/gm,'').trim();
    
                                                if(shortInfoItemFourthElementClean.length > 0)
                                                {
                                                    productCode = parseInt(shortInfoItemFourthElementClean);
                                                }
                                            } 
                                            catch (error) 
                                            {
                                                //await scraperObject.scraperLog(`Bài đăng ${title} => ProductCode`, error, pageUrl, productUrl);
                                            }
                                        }
                                    }

                                    const product = {
                                        SiteId: SITE_ID,
                                        Title: title,
                                        ProductUrl: productUrl,
                                        ProductCode: productCode,
                                        ProvinceId: provinceId,
                                        DistrictId: districtId,
                                        WardId: wardId,
                                        StreetId: streetId,
                                        ProjectId: projectId,
                                        CustomerId: customerId,
                                        Breadcrumb: breadcrumb,
                                        Address: address,
                                        Verified: verified,
                                        IsVideo: isVideo,
                                        ActionTypeId: actionTypeId,
                                        LandTypeId: landTypeId,
                                        PublishedAt: publishedAt,
                                        ExpirationAt: expirationAt
                                    }
            
                                    //console.log(product);
                                    //productId = await products.create(product);
                                }
                            }
                        } 
                        catch (error) 
                        {
                            console.log(`parserProduct =>\n${pageUrl}\n${productUrl}\n=> ${error.name} - ${error.message} - ${error.stack}`);
                        }

                        return productId;
                    }

                    await scrapeCurrentPage(pageUrl);
                }
                else
                {
                    await sleep();

                    console.log(`pageGoto =>\n${pageUrl}\n=> Status code:  ${responseStatus}\n`);

                    await slackLog(`${pageUrl}\n=> Status code:  ${responseStatus}\n`);
                }
            }

        } catch (error) {
            console.log(`scraper => ${error.name} - ${error.message}- ${error.stack}`);
        }
    },
    async newPage (browser, types = ['document']) {

        let page = null;

        try {

            page = await browser.newPage();

            await page.setUserAgent(userAgent.random().toString());

            await page.setRequestInterception(true);

            page.on('request', request => {
                if (!types.includes(request.resourceType()))
                return request.abort();

                request.continue();
            });

        } catch (error) {
            console.log(`newPage => ${error.name} - ${error.message} - ${error.stack}`)
        }

        return page;
    },
    async pageGoto (page, pageUrl){
        let responseStatus; 

        await page.goto(`${pageUrl}`, { waitUntil: 'networkidle2' }).then(response => responseStatus = response.status())
            .catch(error => console.log(`pageGoto('${pageUrl}') => ${error.name} - ${error.message} - ${error.stack}\n`));

        return responseStatus;
    },
    async pageClose (page, pageUrl) {

        await page.close().then( () => console.log(`Đóng page => ${pageUrl || ''}\n`) )
            .catch(error => console.error(`pageClose => ${pageUrl || ''} error => ${error.name} - ${error.message} - ${error.stack}\n`));

    },
    async slackLog (title, pageUrl, productUrl, error) {

        const message = `${pageUrl}-${productUrl}\n${title} => ${error.name} - ${error.message}\n`
        
        console.log(message);

        await slackLog(message);
    }
}

module.exports = scraperObject;