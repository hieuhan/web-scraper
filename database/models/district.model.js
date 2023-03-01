const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (district) => {
    let districtId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Quận / Huyện - ${district.Name}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, district.SiteId)  
            .input("ProvinceId", sql.Int, district.ProvinceId)  
            .input("Name", sql.NVarChar(150), district.Name)  
            .input("Description", sql.NVarChar(150), (district.Description || null))
            .output('DistrictId', sql.Int)
            .execute('Districts_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                resultVar = output['DistrictId'];
            }).catch(error =>  console.error(`Districts_Insert error => ${error}\n`));
    }

    return districtId;
}