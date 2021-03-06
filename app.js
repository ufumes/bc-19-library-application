var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash    = require('connect-flash');
var passport = require('passport');
var session      = require('express-session');
var db = require('./models/db.js');
var book = require('./models/books.js');
var user = require('./models/users.js');
var category = require('./models/categories.js');
var borrowed_book = require('./models/borrowed_books.js')

var routes = require('./routes/index');
var users1 = require('./routes/users');
var books = require('./routes/books');
var categories = require('./routes/categories');
var borrowed_books = require('./routes/borrowed_books.js')
var app = express();

//Load dotenv
var dotenv = require('dotenv');
dotenv.load();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});


app.use('/', routes);
app.use('/users', users1);
app.use('/books', books);
app.use('/categories', categories);


// routes ======================================================================
//require('./routes/routes.js')(app,passport);
require('./config/passport.js')(passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
