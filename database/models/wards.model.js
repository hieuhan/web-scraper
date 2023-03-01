const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (wards) => {
    let wardId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Phường / Xã - ${wards.Name}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, wards.SiteId)  
            .input("ProvinceId", sql.Int, wards.ProvinceId)
            .input("DistrictId", sql.Int, wards.DistrictId)
            .input("Name", sql.NVarChar(150), wards.Name)  
            .input("Description", sql.NVarChar(150), (wards.Description || null))
            .output('WardId', sql.Int)
            .execute('Wards_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                wardId = output['WardId'];
            }).catch(error =>  console.error(`Wards_Insert error => ${error}\n`));
    }

    return wardId;
}