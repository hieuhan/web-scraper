const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports =
{
    databaseUser: process.env.DATABASE_USER,
    databasePassword: process.env.DATABASE_PASSWORD,
    databaseServer: process.env.DATABASE_HOST,
    databaseName: process.env.DATABASE_NAME,
    poolMin: parseInt(process.env.POOL_MIN),
    poolMax: parseInt(process.env.POOL_MAX),
    poolIdleTimeout: parseInt(process.env.POOL_IDLE_TIMEOUT),
    actionBy: process.env.ACTION_BY,
    randomMin: parseInt(process.env.RANDOM_MIN),
    randomMax: parseInt(process.env.RANDOM_MAX),
    executablePath: process.env.EXECUTABLE_PATH
}