var fs = require('fs');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('request');
var busboy = require('connect-busboy');
var elastic = require('elasticsearch');
var nodemailer = require('nodemailer');

var SERVER_PORT = 3000;
var ES_PORT = ':9200';
var HOST = 'localhost';
var INDEX = 'ustmarketplace';
var TYPE = 'item';
var EMAIL_EXT = '@ust.hk';

var app = express();
var client = new elastic.Client({host: HOST + ES_PORT});
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tommaso.girotto91@gmail.com',
        pass: 'kamhlaba'
    }
});

app.use(logger('dev'));
app.set('views', __dirname + '/views/pages');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: false}));
app.use( require('cookie-parser')() );
app.use(bodyParser.json());
app.use(cookieParser());
app.use(busboy());
app.set('port', (process.env.PORT || SERVER_PORT));
app.use(express.static(__dirname + '/public'));

/*******************************************************************************/

app.get('/', function(req, res) {
	getAllItems(function(array) {
		if(array == null)
			res.render('error.ejs');
		else {
			console.log(array);
			res.render('index.ejs', {
				items : array
			});	
		}	
	});
});

app.get('/about', function(req, res) {
	res.render('');
});

app.get('/error', function(req, res) {
	res.render('error.ejs');
});

app.post('/message', function(req, res) {
	console.log('working');
	console.log(req.body);
	res.json({result:"ok"});
});

app.post('/upload', function(req, res) {
	var item_name,
		item_description,
		item_price,
		item_image;

	req.pipe(req.busboy);
	req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
	    if(fieldname == 'item_name')
	     	item_name = val;
	  	if(fieldname == 'item_price')
	      	item_price = val;
	    if(fieldname == 'item_description')
	      	item_description = val;
	  	if(fieldname == 'item_image')
	    	item_image = val;
	    if(fieldname == 'item_owner')
	    	item_owner = val;
	  });

	req.busboy.on('file', function (fieldname, file, filename) {
	    fstream = fs.createWriteStream(__dirname + '/public/img/' + filename);
	    file.pipe(fstream);
	    fstream.on('close', function () {
	    	createItem({
	    		name: item_name,
	    		price: item_price,
	    		description: item_description,
	    		date: new Date().getTime() / 1000,
	    		image: filename,
	    		owner: item_owner,
	    		active: 'true'
	    	}, function(err) {
	    		if(err == null)
	    			res.redirect('/');
	    		else
	    			res.redirect('/error');
	    	});
	    });
	});
});

/*******************************************************************************/
function createItem(obj, callback) {
	client.create({
		index: INDEX,
	    type: TYPE,
	  	body: obj
	}, function (err, res) {
		console.log(res);
		callback(err);
	});
};

function sendEmail(itsc) {
	var mailOptions = {
	    from: 'Tommaso Girotto Foo ✔ <tommaso.girotto91@gmail.com>', // sender address
	    to: itsc + EMAIL_EXT, // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello world ✔', // plaintext body
	    html: '<b>Hello world ✔</b>' // html body
	};

	transporter.sendMail(mailOptions, function(error, info){
	    if(error)
	    	console.log('An error occurred');
	    else {
	        console.log('the email was successfully sent');
	    }
	});
};

function removeItem() {

};

function getAllItems(callback) {
	var array = [];

	client.search({
		index: INDEX,
		body: {
	    	query: {
	      		match_all: {}
	    	}
	  	}
	}, function (err, res) {
		if(err == null) {
			for(var i = 0; i < res.hits.total; i++)
				array.push(res.hits.hits[i]);
		}

		callback(array);
	});
};
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

var server = app.listen(SERVER_PORT, function() {
	console.log('listening on port ', SERVER_PORT);
});