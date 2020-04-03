'use strict';
const bcryptjs = require('bcryptjs')
const saltRounds = 10;
const userList = require('../models/seeds/users')

module.exports = {
  up: (queryInterface, Sequelize) => {
    const users = []
    for (let i = 0; i < userList.users.length; i++) {
      const newUser = userList.users[i]
      newUser.password = bcryptjs.hashSync('123456789', saltRounds)
      newUser.createdAt = new Date()
      newUser.updatedAt = new Date()
      users.push(newUser)
    }
    return queryInterface.bulkInsert('Users', users);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
