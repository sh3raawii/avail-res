const express = require('express')
const { health, readiness } = require('../controllers/health')

const router = express.Router()

router.get('/', health)
router.get('/readiness', readiness)

module.exports = router
