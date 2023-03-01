const axios = require('axios');
const { SLACK_CHANNEL, SLACK_BOT_USERNAME, SLACK_WEBHOOK_URL, RANDOM_MIN, RANDOM_MAX } = require('../configs');

exports.sleep = async () => {
    const time = Math.floor(Math.random() * (RANDOM_MAX - RANDOM_MIN + 1)) + RANDOM_MIN;
        
    console.log(`Đợi xử lý sau => ${time/1000} giây...\n`);
   
    return new Promise(resolve => setTimeout(resolve, time));
}

exports.slackLog = async (message) => {
    try {
        
        console.log('post message to Slack\n');

        const payload = {
            channel: SLACK_CHANNEL,
            username: SLACK_BOT_USERNAME,
            text: message
        };

        await axios.post(SLACK_WEBHOOK_URL, payload);

    } catch (error) {
        console.error(`slackLog => ${error.name} - ${error.message}`);
    }
}

exports.dateToISOString = (day, month, year) => {
    try 
    {
        return [undefined, new Date(`${year.trim()}-${month.trim()}-${day.trim()}`).toISOString()];
    } 
    catch (error) 
    {
        return [error, undefined]
    }
}