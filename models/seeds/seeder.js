const mongoose = require('mongoose')
const Record = require('../record')
const User = require('../user')
const recordList = require('./records')
const userList = require('./users')
const bcrypt = require('bcryptjs')

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/expense_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const db = mongoose.connection

db.on('error', () => {
  console.log('db error')
})

db.once('open', () => {
  console.log('db connected!')

  const users = []
  for (let i = 0; i < userList.users.length; i++) {
    const newUser = new User(userList.users[i])
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err
        newUser.password = hash
        newUser.save()
      })
    })
    users.push(newUser)
  }

  for (let i = 0; i < 15; i++) {
    const category = recordList.records[i].category
    recordList.records[i].userId = users[0]._id
    recordList.records[i][`${category}`] = true
    Record.create(recordList.records[i])
  }

  // node seeder.js

  console.log('done')
})
