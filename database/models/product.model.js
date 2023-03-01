const { config, sql, poolPromise } = require('../init.mssql');

exports.create = async (product) => {
    let productId = 0;
    const pool = await poolPromise;

    if(pool)
    {
        console.log(`Xử lý dữ liệu Khách hàng - ${customer.FullName} / ${customer.PhoneNumber}\n`);

        await pool.request()  
            .input("ActBy", sql.NVarChar(150), config.actionBy)  
            .input("SiteId", sql.Int, product.SiteId)  
            .input("ProvinceId", sql.Int, product.ProvinceId)
            .input("DistrictId", sql.Int, product.DistrictId)
            .input("WardId", sql.Int, product.WardId)
            .input("StreetId", sql.Int, product.StreetId)
            .input("Title", sql.NVarChar(500), product.Title)  
            .input("ProductUrl", sql.NVarChar(255), product.ProductUrl)
            .input("ProductCode", sql.Int, (product.ProductCode || null))
            //.input("ProductContent", sql.NVarChar(sql.MAX), (product.ProductContent || null))
            .input("ProjectId", sql.Int, (product.ProjectId || 0))
            .input("CustomerId", sql.Int, product.CustomerId)
            .input("Breadcrumb", sql.NVarChar(250), (product.Breadcrumb || null)) 
            .input("Address", sql.NVarChar(500), (product.Address || null)) 
            .input("Verified", sql.TinyInt, (product.Verified || null))
            .input("IsVideo", sql.TinyInt, (product.IsVideo || null))
            // .input("Area", sql.Float, (product.Area || null))
            // .input("AreaDisplay", sql.NVarChar(50), (product.AreaDisplay || null)) 
            // .input("Price", sql.Float, (product.Price || null))
            // .input("PriceDisplay", sql.NVarChar(50), (product.PriceDisplay || null))  
            // .input("ComputedPrice", sql.Float, (product.ComputedPrice || null))
            // .input("Facade", sql.Float, (product.Facade || null))
            // .input("FacadeDisplay", sql.NVarChar(50), (product.FacadeDisplay || null)) 
            // .input("WayIn", sql.Float, (product.WayIn || null))
            // .input("WayInDisplay", sql.NVarChar(50), (product.WayInDisplay || null)) 
            // .input("Floors", sql.TinyInt, (product.Floors || null))
            // .input("HouseDirection", sql.NVarChar(50), (product.HouseDirection || null))  
            // .input("BalconyDirection", sql.NVarChar(50), (product.BalconyDirection || null))  
            // .input("Rooms", sql.TinyInt, (product.Rooms || null))
            // .input("Toilets", sql.SmallInt, (product.Toilets || null))
            // .input("Juridical", sql.NVarChar(250), (product.Juridical || null))
            // .input("Interiors", sql.NVarChar(250), (product.Interiors || null))
            // .input("ProductTypeId", sql.Int, (product.ProductTypeId || null))
            .input("CategoryId", sql.Int, (product.CategoryId || null))
            .input("ParentCategoryId", sql.Int, (product.ParentCategoryId || null))
            .input("ActionTypeId", sql.Int, (product.ActionTypeId || null))
            .input("LandTypeId", sql.Int, (product.LandTypeId || null))
            // .input("Latitude", sql.Float, (product.Latitude || null))
            // .input("Longitude", sql.Float, (product.Longitude || null))
            .input("PublishedAt", sql.DateTime, (product.PublishedAt || null))
            .input("ExpirationAt", sql.DateTime, (product.ExpirationAt || null))
            .output('ProductId', sql.Int)
            .execute('Products_Insert').then(function(recordsets) {
                const output = (recordsets.output || {});
                productId = output['ProductId'];
            }).catch(error =>  console.error(`Products_Insert error => ${error}\n`));
    }

    return productId;
}