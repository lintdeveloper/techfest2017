var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const WebSocket = require('ws');

const driver = require('bigchaindb-driver')
let conn = new driver.Connection('https://test.ipdb.io/api/v1/', {
    app_id: '95a772f7',
    app_key: '247aebb45369a85075dc79f7013353d0'
})
const ws = new WebSocket('wss://test.ipdb.io/api/v1/streams/valid_transactions');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(3001);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

io.on('connection', function(client) {
    console.log('Client connected...');


    client.on('join', function(data) {
        console.log(data);
    });
  });
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

ws.on('open', function open() {
  console.log('connection opened');
  //ws.send('something');
});

ws.on('message', function incoming(data) {
  var o = JSON.parse(data);
  console.log(data);
  conn.getTransaction(o.transaction_id).then(details =>   io.emit('transactionCreated', details));

});

module.exports = app;
