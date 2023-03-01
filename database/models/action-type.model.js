const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (actionType) => {
    let actionTypeId = 0;
    const pool = await poolPromise;

    try {

        if(pool)
        {
            console.log(`Xử lý dữ liệu Hành động => ${actionType.Name}\n`);

            await pool.request()  
                .input("ActBy", sql.NVarChar(150), config.actionBy)  
                .input("SiteId", sql.Int, actionType.SiteId)  
                .input("Name", sql.NVarChar(50), actionType.Name)  
                .input("Description", sql.NVarChar(50), (actionType.Description || null))
                .output('ActionTypeId', sql.Int)
                .execute('ActionTypes_Insert').then(function(recordsets) {
                    const output = (recordsets.output || {});
                    actionTypeId = output['ActionTypeId'];
                }).catch(error =>  console.error(`ActionTypes_Insert error => ${error}\n`));
        }

    } catch (error) {
        console.log(`actionType create => ${error.name} - ${error.message} - ${error.stack}`);
    }
    
    return actionTypeId;
}