const moment = require('moment')
const { search } = require('../lib/resturants')

const findOpenResturants = (req, res, next) => {
  const searchDateTime = moment(req.params.datetime)
  // validation
  if (!searchDateTime.isValid()) return res.status(400).send(`Invalid Datetime ${req.params.datetime}`)
  const matches = search(searchDateTime)
  return res.status(200).json(matches)
}

module.exports = {
  findOpenResturants
}
