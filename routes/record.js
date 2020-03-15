const express = require('express')
const router = express.Router()
const Record = require('../models/record')
const moneyCalculation = require('../moneyCalculation')
const { authenticated } = require('../config/auth')

function test(date) {
  const month = date.split('-')
  return month[2]
}

// 得到所有records或篩選出特定種類records
// 設計按鈕按照時間或金錢大小排列，同一個按鈕點兩次會有升降冪功能
// 邏輯：有正面，就弄反面的連結
// 日期格式是 xxxx-xx-xx 例如 2018-03-01，如果要搜尋3月，即搜尋-03-，也就日期字串包含-xx-的資料
router.get('/', authenticated, (req, res) => {
  const type = req.query.type || null
  const field = req.query.field || "date"
  const order = req.query.order || "asc"
  const month = req.query.month || ''

  let nextOrderForDate = "desc"
  if (field === "date" && order === "desc") {
    nextOrderForDate = "asc"
  }

  let nextOrderForAmount = "asc"
  if (field === "amount" && order === "asc") {
    nextOrderForAmount = "desc"
  }

  Record.find({
    userId: req.user._id,
    [type]: type ? true : null,
    date: { $regex: month }
  })
    .sort({ [field]: order })
    .lean()
    .exec((err, records) => {
      const totalAmount = moneyCalculation(records)
      if (err) return console.error(err)
      return res.render('index', { records, totalAmount, type, nextOrderForDate, nextOrderForAmount, month })
    })
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
  data.userId = req.user._id
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
    _id: req.params.id,
    userId: req.user._id,
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
//     _id: req.params.id,
//     userId: req.user._id,
//   }, (err, record) => {
//     console.log('record', record)
//     console.log('record._id', record._id)
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
//     _id: req.params.id,
//     userId: req.user._id,
//   })
//     .lean()
//     .exec((err, record) => {
//       const data = req.body
//       data._id = record._id
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
    _id: req.params.id,
    userId: req.user._id,
  }, (err, record) => {
    const data = req.body
    data._id = record._id
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
    _id: req.params.id,
    userId: req.user._id,
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