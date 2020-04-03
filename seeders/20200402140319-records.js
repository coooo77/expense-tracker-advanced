'use strict';
const userList = require('../models/seeds/users')
const recordList = require('../models/seeds/records')

module.exports = {
  up: (queryInterface, Sequelize) => {
    const records = []
    const idLength = userList.users.length + 1
    for (let id = 1; id < idLength; id++) {
      for (let i = 0; i < recordList.records.length; i++) {
        const newRecord = { ...recordList.records[i] }
        newRecord.home = false
        newRecord.transport = false
        newRecord.entertain = false
        newRecord.food = false
        newRecord.other = false
        newRecord[`${recordList.records[i].category}`] = true
        newRecord.userId = id
        newRecord.createdAt = new Date()
        newRecord.updatedAt = new Date()
        records.push(newRecord)
      }
      // console.log('Records', records)
    }

    return queryInterface.bulkInsert('Records', records);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Records', null, {});
  }
};