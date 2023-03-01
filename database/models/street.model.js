const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (street) => {
    let streetId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Đường / Phố - ${street.Name}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, street.SiteId)  
            .input("ProvinceId", sql.Int, street.ProvinceId)
            .input("DistrictId", sql.Int, street.DistrictId)
            .input("WardId", sql.Int, street.WardId)
            .input("Name", sql.NVarChar(150), street.Name)  
            .input("Description", sql.NVarChar(150), (street.Description || null))
            .output('StreetId', sql.Int)
            .execute('Streets_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                streetId = output['StreetId'];
            }).catch(error =>  console.error(`Streets_Insert error => ${error}\n`));
    }

    return streetId;
}