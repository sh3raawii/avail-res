const { createLogger, format, transports } = require('winston')
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

module.exports = {
  logger
}
