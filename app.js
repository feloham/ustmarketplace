var fs = require('fs');
var express = require('express');
var app = express();
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
var busboy = require('connect-busboy');

var PORT = 3000;

app.use(logger('dev'));
app.set('views', __dirname + '/views/pages');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: false}));
app.use( require('cookie-parser')() );
app.use(bodyParser.json());
app.use(cookieParser());
app.use(busboy());
app.set('port', (process.env.PORT || PORT));
app.use(express.static(__dirname + '/public'));

/*******************************************************************************/

app.get('/', function(req, res) {
	res.render('index.ejs');
});

app.get('/about', function(req, res) {
	res.render('');
});

app.post('/upload', function(req, res) {
	var item_name,
		item_description,
		item_price,
		item_image;

	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
	    if(fieldname == 'item_name')
	      team_name = val;
	    if(fieldname == 'item_description')
	      user_id = val;
	  	if(fieldname == 'item_price')
	      user_id = val;
	  });

	req.busboy.on('file', function (fieldname, file, filename) {
	    fstream = fs.createWriteStream(__dirname + '/public/img/' + filename);
	    file.pipe(fstream);
	    fstream.on('close', function () {
	      	res.redirect('/');
	    });
	});
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