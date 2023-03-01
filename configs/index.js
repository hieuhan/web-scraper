const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..' , '.env') });

module.exports =
{
    RANDOM_MIN: parseInt(process.env.RANDOM_MIN),
    RANDOM_MAX: parseInt(process.env.RANDOM_MAX),
    SLACK_CHANNEL: process.env.SLACK_CHANNEL,
    SLACK_BOT_USERNAME: process.env.SLACK_BOT_USERNAME,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    executablePath: process.env.EXECUTABLE_PATH
}