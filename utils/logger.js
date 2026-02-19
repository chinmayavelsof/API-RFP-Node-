// Will use this to log messages in the seprate log files for each API route
const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logMessage = (message, route) => {
    const timestamp = new Date().toISOString();
    const logFileName = `${route}-${timestamp.replace(/[:.]/g, '-')}.log`;
    const logFilePath = path.join(logDirectory, logFileName);
    fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`);
};

module.exports = {
    logMessage
};