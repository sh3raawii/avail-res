const app = require('./app')
const { logger } = require('./lib/utils')

logger.debug('Starting server')

// Start Express server.
const server = app.listen(app.get('port'), () => {
  logger.info('Server Started', {
    port: app.get('port'),
    env: app.get('env')
  })
})

module.exports = { server }
