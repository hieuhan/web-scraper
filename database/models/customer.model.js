const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (customer) => {
    let customerId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Khách hàng - ${customer.FullName} / ${customer.PhoneNumber}\n`);

        await pool.request()  
        .input("ActBy", sql.NVarChar(150), config.actionBy)  
        .input("SiteId", sql.Int, customer.SiteId)  
        .input("FullName", sql.NVarChar(250), (customer.FullName || null))
        .input("PhoneNumber", sql.NVarChar(50), (customer.PhoneNumber || null))
        .input("SecondPhoneNumber", sql.NVarChar(50), (customer.SecondPhoneNumber || null))
        .input("Email", sql.NVarChar(150), (customer.Email || null))
        .input("Avatar", sql.NVarChar(2000), (customer.Avatar || null))
        .output('CustomerId', sql.Int)
        .execute('Customers_Insert').then(function(recordsets) {
            const output = (recordsets.output || {});
            customerId = output['CustomerId'];
        }).catch(error =>  console.error(`Customers_Insert error => ${error}\n`));
    }

    return customerId;
}