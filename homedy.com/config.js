const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports =
{
    SITE_ID: parseInt(process.env.SITE_ID),
    WEBSITE_DOMAIN: process.env.WEBSITE_DOMAIN
}