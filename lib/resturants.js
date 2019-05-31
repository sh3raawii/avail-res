const fs = require('fs')
const nodeUtils = require('util')
const _ = require('lodash')
const moment = require('moment')
const parseCSV = require('csv-parse/lib/sync')
const { IntervalTree } = require('node-interval-tree')
const intervalTree = new IntervalTree()

const parseCSVFile = async (filePath) => {
  const readFile = nodeUtils.promisify(fs.readFile)
  const data = await readFile(filePath)
  return parseCSV(data.toString(),
    {
      skip_lines_with_empty_values: true,
      skip_empty_lines: true,
      trim: true
    }
  )
}

const weekdayIndex = (weekday) => {
  const dict = {
    'Sun': 0,
    'Mon': 1,
    'Tue': 2,
    'Wed': 3,
    'Thu': 4,
    'Fri': 5,
    'Sat': 6
  }
  const index = dict[weekday]
  if (_.isNil(index)) throw new Error(`Invalid weekday ${weekday}`)
  return index
}

const getDays = (range) => {
  const weekdays = range.split('-')
  const startDay = weekdayIndex(weekdays[0])
  const endDay = weekdayIndex(weekdays[1])
  if (endDay >= startDay) return _.range(startDay, endDay + 1)
  return _.range(0, endDay + 1).concat(_.range(startDay, 7))
}

const parseOpenningHours = (openningHours) => {
  openningHours = openningHours.trim()
  const match = openningHours.match(/(?<days>.+) (?<startTime>\d{1,2}(?::\d{2})? [ap]m) - (?<endTime>\d{1,2}(?::\d{2})? [ap]m)/)
  const startTime = moment(match.groups.startTime, 'hh:mm A')
  const endTime = moment(match.groups.endTime, 'hh:mm A')
  const startTimeInMinutes = startTime.diff(startTime.clone().startOf('day'), 'minutes')
  const endTimeInMinutes = endTime.diff(endTime.clone().startOf('day'), 'minutes')
  // Split time range if circular
  const timeRanges = endTimeInMinutes > startTimeInMinutes ? [{ startTime: startTimeInMinutes, endTime: endTimeInMinutes }]
    : [{ startTime: startTimeInMinutes, endTime: 24 * 60 }, { startTime: 0, endTime: endTimeInMinutes }]
    // Parse Weekdays
  const dayRanges = match.groups.days.match(/\w{3}-\w{3}/g) || []
  const singleDays = match.groups.days.match(/(?:[^-]|^)(\w{3})(?:[^-]|$)/g) || []
  const daysList1 = dayRanges.map(getDays)
  const daysList2 = singleDays.map(day => day.trim().replace(',', '')).map(day => getDays(`${day}-${day}`))
  const days = _.flattenDeep(daysList1.concat(daysList2))
  // Aggregate all the info
  return _.flatten(days.map(day => timeRanges.map(range => _.assign(_.clone(range), { day: day }))))
}

const transformRestaurantsCSVData = (data) => {
  return _.flattenDeep(data.map(restaurant => {
    return _.flattenDeep(restaurant[1].split('/').map(parseOpenningHours))
      .map(slot => Object.assign(slot, { name: restaurant[0] }))
  }))
}

const findOpenRestaurants = async (searchDateTime, filePath) => {
  await loadRestaurantsCSVFile(filePath)
  return search(searchDateTime)
}

const loadRestaurantsCSVFile = async (filePath) => {
  const restaurantsCSVData = await parseCSVFile(filePath)
  const ranges = transformRestaurantsCSVData(restaurantsCSVData)
  ranges.forEach(range => intervalTree.insert({ low: range.startTime, high: range.endTime, data: range }))
}

const search = (searchDateTime) => {
  searchDateTime = moment(searchDateTime)
  const searchDay = searchDateTime.day()
  const searchTimeInMinutes = searchDateTime.diff(searchDateTime.clone().startOf('day'), 'minutes')
  const candidates = intervalTree.search(searchTimeInMinutes, searchTimeInMinutes)
  return candidates.map(candidate => candidate.data).filter(candidate => candidate.day === searchDay)
}

module.exports = {
  findOpenRestaurants,
  loadRestaurantsCSVFile,
  search
}
