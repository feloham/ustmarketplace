var elastic = require('elasticsearch');

var INDEX = 'ustmarketplace';
var TYPE = 'item';
var HOST = 'localhost:9200';

var client = null;

/****************************************************************************************/

function initialize() {
	client	= new elastic.Client({
  		host: HOST
	});

	client.indices.delete({
		timeout: 30000,
		masterTimeout: 30000,
		index: INDEX
	}, function(err, res, status) {
		console.log('Flushed old indexes...');
		client.indices.create({
      timeout: 30000,
      masterTimeout: 30000,
      index: INDEX
    }, function(err, res, status) {
      console.log('New index created');
      client.indices.refresh({
        index: INDEX
      }, function() {
        console.log('Refreshed new index...');
        process.exit();
      });
    });
	});
};

initialize();