const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (scrapeLog) => {
    
    let scrapeLogId = 0;

    try {
        const pool = await poolPromise;

        if(pool)
        {
            console.log(`Xử lý log dữ liệu => ${scrapeLog.Path}\n`);

            await pool.request()  
                .input("ActBy", sql.NVarChar(150), config.actionBy)  
                .input("SiteId", sql.Int, scrapeLog.SiteId)  
                .input("Path", sql.NVarChar(500), scrapeLog.Path)
                .input("DetailPath", sql.NVarChar(500), (scrapeLog.DetailPath || null))
                .input("Message", sql.NVarChar(sql.MAX), (scrapeLog.Message || null))
                .output('ScrapeLogId', sql.Int)
                .execute('ScrapeLogs_Insert').then(function(recordsets) {
                    const output = (recordsets.output || {});
                    scrapeLogId = output['ScrapeLogId'];
                }).catch(error =>  console.error(`ScrapeLogs_Insert error => ${error}\n`));
        }
    } catch (error) {
        console.log(`scrapeLog create => ${error.name} - ${error.message} - ${error.stack}`);
    }

    return scrapeLogId;
}