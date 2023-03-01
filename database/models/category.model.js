const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (category) => {
    let categoryId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Chuyên mục => ${category.Name}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, category.SiteId)  
            .input("ParentId", sql.Int, (category.ParentId || null))  
            .input("Name", sql.NVarChar(50), category.Name)  
            .input("Description", sql.NVarChar(50), (category.Description || null))
            .output('CategoryId', sql.Int)
            .execute('Categories_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                categoryId = output['CategoryId'];
            }).catch(error =>  console.error(`Categories_Insert error => ${error}\n`));
    }

    return categoryId;
}