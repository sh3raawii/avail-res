const express = require('express')
const compression = require('compression')
const { logger, loggerMiddleware } = require('./lib/utils')

// Configure express app
logger.debug('Setting up express app')
const app = express()
app.set('port', process.env.PORT || 8080)

// Middlewares
logger.debug('Setting up middlewares')
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Custom Middlewares
app.use(loggerMiddleware)

// Routes
logger.debug('Mounting routes')
logger.debug('Mounting health check routes')
app.use('/health', require('./routes/health'))

module.exports = app
