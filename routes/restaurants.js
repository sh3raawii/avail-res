const express = require('express')
const { findOpenResturants } = require('../controllers/restaurants')

const router = express.Router()

router.get('/search/:datetime', findOpenResturants)

module.exports = router
