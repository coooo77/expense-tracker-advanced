const moment = require('moment')

function transformDate(list) {
  list.forEach(record => {
    const newDate = moment(record.date).format('YYYY-MM-DD')
    record.date = newDate
  })
  return list
}

module.exports = transformDate