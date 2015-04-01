var express = require('express');
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');

var PORT = 3000;

app.use(logger('dev'));
app.set('views', __dirname + '/views/pages');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: false}));
app.use( require('cookie-parser')() );
app.use(bodyParser.json());
app.use(cookieParser());
app.set('port', (process.env.PORT || PORT));
app.use(express.static(__dirname + '/public'));

/*******************************************************************************/

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.get('/signin', function(req, res) {
	res.render('');
});

app.get('/signup', function(req, res) {
	res.render('');
});

app.get('/about', function(req, res) {
	res.render('');
});

app.get('/upload', function(req, res) {
	res.render('');
});

/*******************************************************************************/

/*******************************************************************************/
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
});

var server = app.listen(PORT, function() {
	console.log('listening on port ', PORT);
});