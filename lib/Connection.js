(function(){

'use strict';

var request	= require('request');
var Promise = require('bluebird');

module.exports = Connection;

function Connection(options) {
	this.config = options.config;
	this.collist = {};
	this._httpAuth = 'Basic ' + new Buffer(this.config.user + ':' + this.config.password).toString('base64');
}


Connection.prototype.updateColumnDefinitions = function(){
	// Function updates the column definition.
	var that = this;
	var basicAuth = this._httpAuth;
	var filter = encodeURI('Serial=0'); // We will not get a hit with this serial, just the columnlist will be retrieved
	var url = 'http://'+this.config.host+':'+this.config.port+'/objectserver/restapi/alerts/status?filter='+filter;
	return new Promise(function(resolve, reject){
		var headers = {'headers': {
			'Host': 'localhost',
			'Authorization': basicAuth,
			'Content-Type': 'application/json'
		}};
		request({
			url: url, 
			method: 'GET',
			headers : headers.headers
			}, function(error, response, body) {
				if(error) {
					reject(error);
				} else {
					// update the columndefinitionvariable
					var obj = JSON.parse(body);
					var coldesc = obj.rowset.coldesc;
					
					coldesc.forEach(function(column, key) {
						that.collist[column.name] = column.type;
					});
					resolve(body);
				}
			});
	});
};

Connection.prototype.query = function(sql, callback) {
	// Convert the sql statement to parameters
	var that=this;
	this.updateColumnDefinitions().then(function(body){
		var restOptions = that.queryBuilder(sql);
		var requestOptions = {
			'method' : restOptions.method,
			'headers': {
				'Host': 'localhost',
				'Authorization': that._httpAuth,
				'Content-Type': 'application/json'
			},
			'payload': restOptions.payload
		};

		switch(restOptions.method) {
			case 'GET':
					requestOptions.path = 	'/objectserver/restapi/'+restOptions.path+
						   					'?collist='+restOptions.collist+
						   					'&filter='+restOptions.filter+
						   					'&orderby='+restOptions.orderBy;
					requestOptions.url = 	'http://'+that.config.host+':'+that.config.port+requestOptions.path;
					requestOptions.payload = null; // Or query will not work
				break;
			case 'POST':
					requestOptions.path = 	'/objectserver/restapi/'+restOptions.path;
					requestOptions.url = 	'http://'+that.config.host+':'+that.config.port+requestOptions.path;
					//console.log(JrequestOptions.payload);
				break;

			case 'DELETE':
					requestOptions.path = 	'/objectserver/restapi/'+restOptions.path+
						   					'?filter='+restOptions.filter;
					requestOptions.url = 	'http://'+that.config.host+':'+that.config.port+requestOptions.path;
					requestOptions.payload = null; // Or query will not work
				break;

			case 'PATCH':
					requestOptions.path = 	'/objectserver/restapi/'+restOptions.path+
						   					'?filter='+restOptions.filter;
					requestOptions.url = 	'http://'+that.config.host+':'+that.config.port+requestOptions.path;
					requestOptions.headers['Content-Length'] = JSON.stringify(restOptions.payload).length;
				break;

			default:

		}
		request({
			url: requestOptions.url, 
			method: requestOptions.method,
			headers : requestOptions.headers,
			body: JSON.stringify(requestOptions.payload)
		}, function(error, response, body) {
				var obj = JSON.parse(body);
				var affectedRows = 0;
				switch(requestOptions.method) {
					case 'PATCH' :
						obj.rowset = {}; // no rowset return for PATCH
						obj.rowset.rows = []; // no rows return for PATCH
						obj.rowset.coldesc = {}; // no coldesc for PATCH
						affectedRows = {};
						break;
					case 'DELETE' :
						obj.rowset = {}; // no rowset return for DELETE
						obj.rowset.rows = []; // no rows return for DELETE
						obj.rowset.coldesc = {}; // no coldesc for DELETE
						affectedRows = obj.entry.affectedRows;
						break;
					case 'GET' :
						affectedRows = obj.rowset.affectedRows;
						break;
					default:
						// should never end up here
				}
		      	callback(error, obj.rowset.rows, affectedRows, obj.rowset.coldesc);
		 	});
	}).catch(function(error){
		console.log(error);
	}).bind(this);	
};

Connection.prototype.queryBuilder = function(sql) {
	// Converts a Objectserver SQL to REST call
	// SELECT Node, Summary FROM alerts.status where Severity > 0


	var restOptions = {};
	var collist = this.collist;
	restOptions.payload = {};
	restOptions.payload.rowset = {};
	restOptions.payload.rowset.coldesc = [];
	restOptions.payload.rowset.rows = [];
	restOptions.payload.rowset.rows[0] = {};

	// Get REST keyword (SELECT, UPDATE, PUT, DELETE)
	var keyword = sql.substr(0, sql.indexOf(" ")); // First word of sql string
	switch(keyword.toUpperCase()) {
		case 'SELECT' :			
			restOptions.method = 'GET';
			break;
		case 'UPDATE' :
			restOptions.method = 'PATCH';
			break;
		case 'INSERT' :
			restOptions.method = 'POST';
			break;
		case 'DELETE' :
			restOptions.method = 'DELETE';
			break;
		default:
			throw new Error('Cannot find keyword \'' + keyword + '\'');
	}

	// get collist (Node, Summary) - Only for Select
	if(restOptions.method==='GET')
	{
		var rexpression = new RegExp(keyword+' ([A-Za-z0-9,\-\\s\*]+) [Ff][Rr][Oo][Mm] ');
		var colmatch = sql.match(rexpression);
                //console.log("colmatch="); console.log(colmatch);
                //console.log("rexpression"); console.log(rexpression);
                //console.log("sql.match(rexpression)"); console.log(sql.match(rexpression));
		if (!colmatch){
			collist[1] = '*'; // No columns selected, get all
		}
		var collist = colmatch[1].replace(/ /g,''); // Remove whitespaces
		if (collist === '*') {
			restOptions.collist = '';
		} else {
			restOptions.collist = encodeURI(collist);
		}
	}

	// get columns and database for UPDATE 
	if(restOptions.method==='PATCH') 
	{
		restOptions.path='';
		restOptions.filter='';
		var fields = '';
		var rexpression = new RegExp(keyword+' ([A-Za-z0-9]+\.[A-Za-z0-9]+) [Ss][Ee][Tt] .*');
		var dbmatch = sql.match(rexpression);

                console.log("dbmatch="); console.log(dbmatch);

		if (!dbmatch) {
			// no database selected, trow error
			throw new Error('No database selected!');
		}
		var database = dbmatch[1];
		restOptions.path = database.replace('.','/');

		// get fields to be updated

		// check if sql contains 'where'
		if (sql.match('.* [Ww][Hh][Ee][Rr][Ee] .*'))
		{
			// Where, calculate filter
			var rexpression = new RegExp('[Ss][Ee][Tt] (.*) [Ww][Hh][Ee][Rr][Ee] (.*)');
			var fieldsmatch = sql.match(rexpression);
                        console.log("fieldsmatch = "); console.log(fieldsmatch); 
                        restOptions.filter=encodeURI(fieldsmatch[2]);
                        console.log("restOptions.filter"); console.log(restOptions.filter);
                        
		}
		else
		{
			// No Where
			restOptions.filter='';

			// Whithout where, get fields
			var rexpression = new RegExp('[Ss][Ee][Tt] (.*)$');
			var fieldsmatch = sql.match(rexpression);

		}
		// Create the rows object 
		// first remove whitespaces
		var fieldsString = fieldsmatch[1].replace(/ /g,'');
                //console.log("fieldsString = ");console.log(fieldsString);
		// get them into an array
		var fieldsArray = fieldsString.split(',');

		

			fieldsArray.forEach(function(field){
                                field = field.replace(/'/g,'');
				var fieldObject = field.replace(/"/g,'').split('=');
				var fieldName = fieldObject[0];
				var fieldValue = fieldObject[1];
				
				var rowsItem = {};
				rowsItem[fieldName] = fieldValue;

				var colsItem = {
					"type" : collist[fieldName],
					"name" : fieldName
				};

				restOptions.payload.rowset.rows[0][fieldName] = fieldValue;
				restOptions.payload.rowset.coldesc.push(colsItem);
		});
	}

	// Get REST path (database) - Only for SELECT, DELETE
	if(restOptions.method==='GET' || restOptions.method==='DELETE')
	{
		var rexpression = new RegExp(keyword+'.* [Ff][Rr][Oo][Mm] ([A-Za-z0-9]+\.[A-Za-z0-9]+)');
		var dbmatch = sql.match(rexpression);
		if (!dbmatch) {
			// no database selected, trow error
			throw new Error('No database selected!');
		}
		var database = dbmatch[1];
		restOptions.path = database.replace('.','/');
	}


	// get REST filter - ONLY FOR GET and DELETE
	if(restOptions.method==='GET' || restOptions.method==='DELETE')
	{
		restOptions.orderBy='';
		restOptions.filter='';
		// check if sql contains 'order by'
		if (sql.match('.* [Oo][Rr][Dd][Ee][Rr] [Bb][Yy] .*'))
		{
			var rexpression = new RegExp('.* [Ww][Hh][Ee][Rr][Ee] (.*) [Oo][Rr][Dd][Ee][Rr] [Bb][Yy].*');
			var filtermatch = sql.match(rexpression);
                        console.log("SELECT filtermatch:"); console.log(filtermatch);
			if(!filtermatch) {
				restOptions.filter='';
			} else {
				restOptions.filter=encodeURI(filtermatch[1]);
			}
			// get orderby
			var rexpression = new RegExp('.* [Oo][Rr][Dd][Ee][Rr] [Bb][Yy] (.*)');
			var orderbymatch = sql.match(rexpression);
			if(!orderbymatch) {
				restOptions.orderBy='';
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
				restOptions.filter='';
			} else {
				restOptions.filter=encodeURI(filtermatch[1]);
			}
		}
	}
	rexpression = null;
	return restOptions;


};


}()); // End 