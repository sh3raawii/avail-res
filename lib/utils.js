const { createLogger, format, transports } = require('winston')
const expressWinston = require('express-winston')
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

const logger = createLogger({
  level: LOG_LEVEL,
  stderrLevels: ['error'],
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [new transports.Console()]
})

const loggerMiddleware = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTPS {{req.method}} {{req.url}} - {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: false
})

module.exports = {
  logger,
  loggerMiddleware
}
