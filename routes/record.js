const express = require('express')
const router = express.Router()
const db = require('../models')
const User = db.User
const Record = db.Record
const { Op } = require("sequelize")
// const Record = require('../models/record')
const moneyCalculation = require('../moneyCalculation')
const transformDate = require('../transformDate')
const { authenticated } = require('../config/auth')
const moment = require('moment')

// 得到所有records或篩選出特定種類records
// 設計按鈕按照時間或金錢大小排列，同一個按鈕點兩次會有升降冪功能
// 邏輯：有正面，就弄反面的連結
router.get('/', authenticated, (req, res) => {
  const category = req.query.category || ''
  let home
  let transport
  let entertain
  let food
  let other
  if (category === 'home') {
    home = true
  } else if (category === 'transport') {
    transport = true
  } else if (category === 'entertain') {
    entertain = true
  } else if (category === 'food') {
    food = true
  } else if (category === 'other') {
    other = true
  }

  const field = req.query.field || "date"
  const order = req.query.order || "asc"

  // 設定對應的順序
  let nextOrderForDate = "desc"
  if (field === "date" && order === "desc") {
    nextOrderForDate = "asc"
  }

  let nextOrderForAmount = "asc"
  if (field === "amount" && order === "asc") {
    nextOrderForAmount = "desc"
  }

  // 依照需求建立物件queryWhere給Record.findAll使用  

  // 建立queryWhere裡面的使用者名稱
  const queryUserId = { UserId: req.user.id }

  // 建立queryWhere裡面的搜尋資料類型
  let queryType
  if (req.query.category !== undefined) {
    if (req.query.category !== 'all') {
      queryType = { category: `${req.query.category}` }
    }
  } else {
    queryType = {}
  }

  // 建立queryWhere裡面的搜尋時間
  let dateFrom = req.query.dateFrom || ''
  let dateTo = req.query.dateTo || ''
  let queryMonth = {
    date: {
      [Op.lt]: dateTo ? new Date(`${dateTo}`) : new Date('9999-12-30'),
      [Op.gt]: dateFrom ? new Date(`${dateFrom}`) : new Date('0000-01-01')
    }
  }

  // 組成物件queryWhere
  const queryWhere = Object.assign(queryUserId, queryType, queryMonth)

  // 處理給Record.findAll的物件
  // 沒有req.query，那就是剛登入的狀態，不需要向資料庫尋求排列order
  let queryObject
  if (!Object.values(req.query).length) {
    queryObject = {
      raw: true,
      nest: true,
      where: queryWhere
    }
  } else {
    queryObject = {
      order: [[`${field}`, `${order}`]],
      raw: true,
      nest: true,
      where: queryWhere
    }
  }

  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error("user not found")
      return Record.findAll(queryObject)
    })
    .then((records) => {
      const totalAmount = moneyCalculation(records)
      const newRecords = transformDate(records)
      return res.render('index', { records: newRecords, totalAmount, dateFrom, dateTo, category, nextOrderForDate, nextOrderForAmount, home, transport, entertain, food, other })
    })
    .catch((error) => { return res.status(422).json(error) })
})

// 新增records頁面
router.get('/new', authenticated, (req, res) => {
  res.render('new')
})

// 新增records
router.post('/', authenticated, (req, res) => {
  const data = req.body
  const select = { [data.category]: true }
  const check = Object.values(data).filter(value => value === "").length
  data.UserId = req.user.id
  if (check) {
    const errors = [{ message: '資料不齊全' }]
    res.render('new', { data, errors, select })
  } else {
    data.home = false
    data.transport = false
    data.entertain = false
    data.food = false
    data.other = false
    data[req.body.category] = true
    Record.create(data)
      .then((record) => { return res.redirect('/') })
      .catch((error) => { return res.status(422).json(error) })
  }
})

// 編輯records頁面
router.get('/:id/edit', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error("user not found")
      return Record.findOne({
        where: {
          Id: req.params.id,
          UserId: req.user.id,
        }
      })
    })
    .then((record) => {
      // input(type為date)的value一定要弄成XXXX-XX-XX的格式，如果弄成XXXX-X-X便不會顯示
      const newRecord = record.get()
      // newRecord.date = new Date(newRecord.date)
      // const year = newRecord.date.getFullYear()
      // const month = (newRecord.date.getMonth() + 1) < 10 ? '0' + (newRecord.date.getMonth() + 1) : (newRecord.date.getMonth() + 1)
      // const date = (newRecord.date.getDate()) < 10 ? '0' + (newRecord.date.getDate()) : (newRecord.date.getDate())
      // const newDate = `${year}-${month}-${date}`

      // 用套件monent轉換日期，可以省下上面那串打法
      const newDate = moment(newRecord.date).format('YYYY-MM-DD')
      return res.render('edit', { record: record.get(), newDate })
    })
})

// 編輯records
router.put('/:id/edit', authenticated, (req, res) => {
  req.body.id = req.params.id
  const data = req.body
  const select = { [data.category]: true }
  const check = Object.values(data).filter(value => value === "").length
  if (check) {
    const errors = [{ message: '資料不齊全' }]
    res.render('edit', { data, errors, select })
  } else {
    Record.findOne({
      where: {
        Id: req.params.id,
        UserId: req.user.id,
      }
    })
      .then((record) => {
        record[record.category] = false
        record[req.body.category] = true
        Object.assign(record, req.body)

        return record.save()
      })
      .then((record) => { return res.redirect('/') })
      .catch((error) => { return res.status(422).json(error) })
  }
})

// 刪除records
router.delete('/:id/delete', authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) throw new Error("user not found")

      return Record.destroy({
        where: {
          UserId: req.user.id,
          Id: req.params.id
        }
      })
    })
    .then((todo) => { return res.redirect('/') })
    .catch((error) => { return res.status(422).json(error) })
})

module.exports = router