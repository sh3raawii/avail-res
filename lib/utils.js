const fs = require('fs')
const nodeUtils = require('util')
const multer = require('multer')
const parseCSV = require('csv-parse/lib/sync')
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

const uploadCSV = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    cb(null, /.*\.csv$/.test(file.originalname) &&
      (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel'))
  }
})

const readFileAsync = async (filePath) => {
  const readFile = nodeUtils.promisify(fs.readFile)
  return readFile(filePath)
}

const parseCSVBuffer = async (buffer) => {
  return parseCSV(buffer.toString(),
    {
      skip_lines_with_empty_values: true,
      skip_empty_lines: true,
      trim: true
    }
  )
}

module.exports = {
  logger,
  loggerMiddleware,
  readFileAsync,
  uploadCSV,
  parseCSVBuffer
}
