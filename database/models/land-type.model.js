const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (landType) => {
    let landTypeId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Loại nhà đất - ${landType.Name}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, landType.SiteId)  
            .input("Name", sql.NVarChar(150), landType.Name)  
            .input("Description", sql.NVarChar(150), (landType.Description || null))
            .output('LandTypeId', sql.Int)
            .execute('LandTypes_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                landTypeId = output['LandTypeId'];
            }).catch(error =>  console.error(`LandTypes_Insert error => ${error}\n`));
    }

    return landTypeId;
}