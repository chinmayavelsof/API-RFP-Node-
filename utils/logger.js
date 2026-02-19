// Log only error and info to separate log files
const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const LOG_LEVELS = ['info', 'error'];

const writeLog = (level, message, meta = {}) => {
    if (!LOG_LEVELS.includes(level)) return;
    const timestamp = new Date().toISOString();
    const logFileName = `${level}.log`;
    const logFilePath = path.join(logDirectory, logFileName);
    const route = meta.route ? ` [${meta.route}]` : '';
    let line = `${timestamp}${route} - ${message}\n`;
    if (meta.requestBody !== undefined) {
        const bodyStr = typeof meta.requestBody === 'string' ? meta.requestBody : JSON.stringify(meta.requestBody);
        line += `  requestBody: ${bodyStr}\n`;
    }
    if (meta.responseBody !== undefined) {
        const bodyStr = typeof meta.responseBody === 'string' ? meta.responseBody : JSON.stringify(meta.responseBody);
        line += `  responseBody: ${bodyStr}\n`;
    }
    try {
        fs.appendFileSync(logFilePath, line);
    } catch (err) {
        process.stderr.write(`Logger write failed: ${err.message}\n`);
    }
};

const info = (message, meta = {}) => writeLog('info', message, meta);
const error = (message, meta = {}) => writeLog('error', message, meta);

module.exports = {
    info,
    error,
};
