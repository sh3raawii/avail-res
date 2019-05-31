const express = require('express')
const { uploadCSV } = require('../lib/utils')
const { findOpenResturants, importCSV } = require('../controllers/restaurants')

const router = express.Router()

router.get('/search/:datetime', findOpenResturants)
router.post('/csv', uploadCSV.single('document'), importCSV)

module.exports = router
