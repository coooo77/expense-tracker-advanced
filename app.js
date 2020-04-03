const express = require('express')
const app = express()
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const passport = require('passport')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const port = 3000 // = process.env

// const mongoose = require('mongoose')
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/expense_tracker', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true
// })

// const db = mongoose.connection
// db.on('error', () => {
//   console.log('mongodb error!')
// })
// db.once('open', () => {
//   console.log('mongodb connected!')
// })

app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true,
}))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)
app.use(flash())

app.use((req, res, next) => {
  // console.log('req.user', req.user)
  res.locals.user = req.user
  // console.log('req.user.id', req.user.id)
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})

app.use('/', require('./routes/home'))
app.use('/auth', require('./routes/auths'))
app.use('/users', require('./routes/user'))
app.use('/records', require('./routes/record'))

app.listen(process.env.PORT || port, () => {
  console.log(`App is running on http://localhost:${port}`)
})