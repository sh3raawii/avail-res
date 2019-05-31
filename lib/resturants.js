const fs = require('fs')
const nodeUtils = require('util')
const _ = require('lodash')
const moment = require('moment')
const parseCSV = require('csv-parse/lib/sync')
let csvData = null

const parseCSVFile = async (filePath) => {
  if (csvData) return csvData
  const readFile = nodeUtils.promisify(fs.readFile)
  const data = await readFile(filePath)
  csvData = parseCSV(data.toString(),
    {
      skip_lines_with_empty_values: true,
      skip_empty_lines: true,
      trim: true
    }
  )
  return csvData
}

const transformRestaurantsCSVData = (data) => {
  const formatOpenningHours = (openningHours) => {
    openningHours = openningHours.trim()
    const match = openningHours.match(/(?<days>.+) (?<startTime>\d{1,2}(?::\d{2})? [ap]m) - (?<endTime>\d{1,2}(?::\d{2})? [ap]m)/)
    const startTime = moment(match.groups.startTime, 'hh:mm A')
    const endTime = moment(match.groups.endTime, 'hh:mm A')
    const startTimeInMinutes = startTime.diff(startTime.clone().startOf('day'), 'minutes')
    const endTimeInMinutes = endTime.diff(endTime.clone().startOf('day'), 'minutes')
    const dayRanges = match.groups.days.match(/\w{3}-\w{3}/g) || []
    const singleDays = match.groups.days.match(/(?:[^-]|^)(\w{3})(?:[^-]|$)/g) || []
    const firstArray = dayRanges.map(range => range.trim()).map(range => {
      return {
        startTime: startTimeInMinutes,
        endTime: endTimeInMinutes > startTimeInMinutes ? endTimeInMinutes : endTimeInMinutes + 24 * 60,
        daysRange: range
      }
    })
    const secondArray = singleDays.map(day => day.trim()).map(day => {
      return {
        startTime: startTimeInMinutes,
        endTime: endTimeInMinutes > startTimeInMinutes ? endTimeInMinutes : endTimeInMinutes + 24 * 60,
        daysRange: `${day}-${day}`
      }
    })
    return firstArray.concat(secondArray)
  }

  return data.map(restaurant => {
    return _.flattenDeep(restaurant[1].split('/').map(formatOpenningHours))
      .map(slot => Object.assign(slot, { name: restaurant[0] }))
  })
}

const findOpenRestaurants = async (searchDateTime, filePath) => {
  const restaurantsData = await parseCSVFile(filePath)
  return transformRestaurantsCSVData(restaurantsData)
  // TODO: Implement the ranges search
}


module.exports = {
    findOpenRestaurants
}