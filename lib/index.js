var http = require('http');

function createConnection(options) {
	
	this.host	= options.host;

	console.log("Host:"+this.host);

	/*
	var self = this;

	this.username = 'root',
	password = '',
	url	= 'http://primarywebserver:8080/objectserver/restapi/alerts/status';

	*/

	

}
/*
omnibusConnection.prototype.query = function query(){
	var options = {
	   host: 'primarywebserver',
	   port: 8080,
	   path: '/objectserver/restapi/alerts/status',
	   // authentication headers
	   headers: {
	      'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
	   }   
	};

	request = http.get(options, function(res){
	   var body = "";
	   res.on('data', function(data) {
	      body += data;
	   });
	   res.on('end', function() {
	    //here we have the full response, html or json object
	      console.log(body);
	   })
	   res.on('error', function(e) {
	      console.log("Got error: " + e.message);
	   });
	});
}
*/
module.exports.createConnection = createConnection;
