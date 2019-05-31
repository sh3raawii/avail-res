const _ = require('lodash')
const moment = require('moment')
const { search, loadRestaurantsCSVData } = require('../lib/resturants')

const findOpenResturants = (req, res, next) => {
  const searchDateTime = moment(req.params.datetime)
  // validation
  if (!searchDateTime.isValid()) return res.status(400).send(`Invalid Datetime ${req.params.datetime}`)
  const matches = search(searchDateTime)
  return res.status(200).json(matches)
}

const importCSV = (req, res, next) => {
  const csvFile = req.file
  if (_.isNil(csvFile)) res.send(400).send('missing CSV File')
  loadRestaurantsCSVData(csvFile.buffer).then(() => {
    res.status(200).send()
  }).catch((err) => {
    res.status(400).send(err)
  })
}

module.exports = {
  findOpenResturants,
  importCSV
}
