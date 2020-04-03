const express = require('express')
const router = express.Router()
const db = require('../models')
const User = db.User
const Record = db.Record
const { Op } = require("sequelize")
// const Record = require('../models/record')
const moneyCalculation = require('../moneyCalculation')
const { authenticated } = require('../config/auth')

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
      return res.render('index', { records, totalAmount, dateFrom, dateTo, category, nextOrderForDate, nextOrderForAmount, home, transport, entertain, food, other })
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
  data.userId = req.user.id
  if (check) {
    const errors = [{ message: '資料不齊全' }]
    res.render('new', { data, errors, select })
  } else {
    const record = new Record(data)
    record[req.body.category] = true
    record.save(err => {
      if (err) return console.log(err)
      return res.redirect('/')
    })
  }
})

// 編輯records頁面
router.get('/:id/edit', authenticated, (req, res) => {
  Record.findOne({
    id: req.params.id,
    userId: req.user.id,
  })
    .lean()
    .exec((err, record) => {
      if (err) return console.error(err)
      return res.render('edit', record)
    })
})

// 如果return res.render('edit', record)中的record沒有用{}，則可以用this作指派
// 如果硬要寫{}，下面寫法要用.lean()處理，不然得到的不是純物件，會有警告
// 什麼時候才要用.lean().exec? 看教材好像只有從資料庫讀取資料時才會用到
// router.get('/:id/edit', authenticated, (req, res) => {
//   Record.findOne({
//     id: req.params.id,
//     userId: req.user.id,
//   }, (err, record) => {
//     console.log('record', record)
//     console.log('record.id', record.id)
//     if (err) return console.error(err)
//     return res.render('edit', { record })
//   })
// }) 

// 編輯records
// 編輯的data check要怎麼寫比較好?一個欄位故意不填寫就會產生BUG，可是用兩種{{}}感覺很微妙，是否有更優雅的方法?
// 看tim同學的作法，用input用required就好，不過可以故意修改頁面繞過這個問題的樣子?
// 當編輯records的時候，用.lean().exec()處理的資料會沒辦法用.save .....?!
// TypeError: record.save is not a function
// 以下為會產生錯誤的寫法
// router.put('/:id/edit', authenticated, (req, res) => {
//   Record.findOne({
//     id: req.params.id,
//     userId: req.user.id,
//   })
//     .lean()
//     .exec((err, record) => {
//       const data = req.body
//       data.id = record.id
//       const select = { [data.category]: true }
//       const check = Object.values(data).filter(value => value === "").length
//       if (check) {
//         const errors = [{ message: '資料不齊全' }]
//         console.log('data', data)
//         res.render('edit', { data, errors, select })
//       } else {
//         if (err) return console.error(err)
//         record[record.category] = false
//         record[req.body.category] = true
//         Object.assign(record, req.body)
//         record.save(err => {
//           if (err) return console.error(err)
//           return res.redirect('/')
//         })
//       }
//     })
// })

router.put('/:id/edit', authenticated, (req, res) => {
  Record.findOne({
    id: req.params.id,
    userId: req.user.id,
  }, (err, record) => {
    const data = req.body
    data.id = record.id
    const select = { [data.category]: true }
    const check = Object.values(data).filter(value => value === "").length
    if (check) {
      const errors = [{ message: '資料不齊全' }]
      console.log('data', data)
      res.render('edit', { data, errors, select })
    } else {
      if (err) return console.error(err)
      record[record.category] = false
      record[req.body.category] = true
      Object.assign(record, req.body)
      record.save(err => {
        if (err) return console.error(err)
        return res.redirect('/')
      })
    }
  })
})

// 刪除records
router.delete('/:id/delete', authenticated, (req, res) => {
  Record.findOne({
    id: req.params.id,
    userId: req.user.id,
  }, (err, record) => {
    console.log('record', record)
    if (err) return console.error(err)
    record.remove(err => {
      if (err) return console.error(err)
      return res.redirect('/')
    })
  })
})

module.exports = router