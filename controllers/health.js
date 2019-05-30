const healthCheck = (req, res, next) => {
  res.json('Server is up')
}

const readiness = (req, res, next) => {
  res.json('All good, chief')
}

module.exports = {
  health: healthCheck,
  readiness: readiness
}
