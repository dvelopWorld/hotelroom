const bodyParser = require('body-parser');
var createError = require('http-errors');
var express = require('express');
const expressLayouts = require('express-ejs-layouts');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/admin-layout');

app.use(logger('dev'));
// app.use(express.json());
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



const redisClient = redis.createClient({legacyMode: true});
redisClient.connect().catch(console.error);
app.use(session({store: new RedisStore({client: redisClient}), resave: false, secret: "Shh, its a secret!", expires: new Date(Date.now() + (30 * 86400 * 1000))}));       // expires in 30 days



app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next){
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  app.locals.req = req.session;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log('error: ', res.locals.error);

  // render the error page
  res.status(err.status || 500);
  res.render('error', {title: `Error - ${res.status}`, layout: false});
});

const Sequelize = require('sequelize');
app.locals.sequelize = new Sequelize('hotelroom', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }, operatorsAliases: false
});

module.exports = app;
