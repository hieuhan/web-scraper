const sql = require('mssql');
const config = require('../configs/db.config');

const poolPromise = new sql.ConnectionPool({
    user: config.databaseUser,  
    password: config.databasePassword,  
    server: config.databaseServer,  
    database: config.databaseName,
    pool: {
        max: config.poolMax,
        min: config.poolMin,
        idleTimeoutMillis: config.poolIdleTimeout
    },
    options: {
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
})
  .connect()
  .then(pool => {
    console.log('Connected to SQLServer...');
    return pool;
  })
  .catch(error => console.log('Database Connection Failed!: ', error));

module.exports = {
  config, sql, poolPromise
};