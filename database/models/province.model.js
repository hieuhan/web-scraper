const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (province) => {

    const pool = await poolPromise;
    let provinceId = 0;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Tỉnh / Thành phố - ${province.Name}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, province.SiteId)  
            .input("Name", sql.NVarChar(150), province.Name)  
            .input("Description", sql.NVarChar(150), (province.Description || null))
            .output('ProvinceId', sql.Int)
            .execute('Provinces_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                provinceId = output['ProvinceId'];
            }).catch(error =>  console.error(`Provinces_Insert error => ${error}\n`));
    }

    return provinceId;
}