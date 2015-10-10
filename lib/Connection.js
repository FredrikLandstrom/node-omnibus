var http 	= require('http');

module.exports = Connection;

function Connection(options) {
	this.config = options.config;
	this._httpAuth = 'Basic ' + new Buffer(this.config.user + ':' + this.config.password).toString('base64');
}

Connection.prototype.query = function query(sql, callback) {

	this.body = {};
	var err = "";

	var restOptions = Connection.queryBuilder(sql);

	this.queryOptions = {
	   host: this.config.host,
	   port: this.config.port,
	   path: '/objectserver/restapi/'+restOptions.path+
	   			'?collist='+restOptions.collist+
	   			'&filter='+restOptions.filter+
	   			'&orderby='+restOptions.orderBy,
	   // authentication headers
	   headers: {
	      'Authorization': this._httpAuth
	   }   
	};

	request = http.get(this.queryOptions, function(res){
	   var body = "";
	   res.on('data', function(data) {
	      body += data;
	   });
	   res.on('end', function() {
	   	  var obj = JSON.parse(body);
	      callback(err, obj.rowset.rows, obj.rowset.affectedRows, obj.rowset.coldesc);
	   })
	   res.on('error', function(e) {
	 		this.err = e;
	   });
	});
	

}

Connection.queryBuilder = function(sql) {
	// Converts a Objectserver SQL to REST call
	// SELECT Node, Summary FROM alerts.status where Severity > 0
	var restOptions = {};

	// Get REST keyword (SELECT, UPDATE, PUT, DELETE)
	var keyword = sql.substr(0, sql.indexOf(" ")); // First word of sql string
	
	switch(keyword.toUpperCase()) {
		case 'SELECT' :			
			restOptions.method = 'GET';
			break;
		case 'UPDATE' :
			// in progress
			break;
		case 'INSERT' :
			// in progress
			break;
		case 'DELETE' :
			restOptions.method = 'DELETE';
		default:
			throw new Error('Cannot find keyword \'' + keyword + '\'');
	}

	// get collist (Node, Summary)
	var rexpression = new RegExp(keyword+' ([A-Za-z0-9,\-\\s\*]+) [Ff][Rr][Oo][Mm] ');
	var colmatch = sql.match(rexpression);
	if (!colmatch){
		// no motch, trow error
		throw new Error('No columns selected!');
	}
	var collist = colmatch[1].replace(/ /g,''); // Remove whitespaces
	if (collist === '*') {
		restOptions.collist = ''
	} else {
		restOptions.collist = encodeURI(collist);
	}

	// Get REST path (database)
	var rexpression = new RegExp(keyword+' .* [Ff][Rr][Oo][Mm] ([A-Za-z0-9]+\.[A-Za-z0-9]+)');
	var dbmatch = sql.match(rexpression);
	if (!dbmatch) {
		// no database selected, trow error
		throw new Error('No database selected!');
	}
	var database = dbmatch[1];
	restOptions.path = database.replace('.','/');


	// get filter
	// check if sql contains 'order by'
	if (sql.match('.*[Oo][Rr][Dd][Ee][Rr] [Bb][Yy].*'))
	{
		var rexpression = new RegExp('.* [Ww][Hh][Ee][Rr][Ee] (.*) [Oo][Rr][Dd][Ee][Rr] [Bb][Yy].*');
		var filtermatch = sql.match(rexpression);
		if(!filtermatch) {
			restOptions.filter=''
		} else {
			restOptions.filter=encodeURI(filtermatch[1]);
		}
		// get orderby
		var rexpression = new RegExp('.* [Oo][Rr][Dd][Ee][Rr] [Bb][Yy] (.*)');
		var orderbymatch = sql.match(rexpression);
		if(!orderbymatch) {
			restOptions.orderBy=''
		}
		else {
			restOptions.orderBy=encodeURI(orderbymatch[1]);
		}
	}
	else {
		// No order by
		var rexpression = new RegExp('.* [Ww][Hh][Ee][Rr][Ee] (.*)$');
		var filtermatch = sql.match(rexpression);
		if(!filtermatch) {
			restOptions.filter=''
		} else {
			restOptions.filter=encodeURI(filtermatch[1]);
		}
	}

	rexpression = null;
	return restOptions;


}