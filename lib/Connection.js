(function () {

    'use strict';

    var request = require('request');
    var Promise = require('bluebird');

    module.exports = Connection;

    function Connection(options) {
        this.config = options.config;
        if (this.config.SSLEnable) {
          this.config.protocol = "https://";
        } else {
          this.config.protocol = "http://";
        }
        this.collist = {};
        this._httpAuth = 'Basic ' + new Buffer(this.config.user + ':' + this.config.password).toString('base64');
    }


    Connection.prototype.updateColumnDefinitions = function () {
        // Function updates the column definition.
        var that = this;
        return new Promise(function (resolve, reject) {
          var basicAuth = that._httpAuth;
          var filter = encodeURI('Serial=0');
          var options = {
		          url : that.config.protocol + that.config.host + ':' + that.config.port + '/objectserver/restapi/alerts/status?filter=' + filter,
		          method: 'GET',
		          headers: {
		            'Host': 'localhost',
		            'Authorization': basicAuth,
		            'Content-Type': 'application/json'
		          }
		        }

          request(options, function (error, response, body) {
              if(error) {
                reject(error);
              } else {
                // update the columndefinitionvariable

                var obj = JSON.parse(body);
                var coldesc = obj.rowset.coldesc;
                var numberOfItemsProcessed = 0; // used for counter
                coldesc.forEach(function (column, key, array) {
                    that.collist[column.name] = column.type;
                    numberOfItemsProcessed++;
										if(numberOfItemsProcessed === array.length) {
		                  resolve(body);
										}
                });
              }
            }
          );
      });
    };

    Connection.prototype.query = function (sql, callback) {
        // Convert the sql statement to parameters
        var that = this;
        // Build the Query, then create the request options.
        var restOptions = that.queryBuilder(sql).then(function(restOptions){

          var requestOptions = {
              'method': restOptions.method,
              'headers': {
                  'Host': 'localhost',
                  'Authorization': that._httpAuth,
                  'Content-Type': 'application/json'
              },
              'payload': restOptions.payload
          };
          switch (restOptions.method) {
              case 'GET':
                  requestOptions.path = '/objectserver/restapi/' + restOptions.path +
                          '?collist=' + restOptions.collist +
                          '&filter=' + restOptions.filter +
                          '&orderby=' + restOptions.orderBy;
                  requestOptions.url = that.config.protocol + that.config.host + ':' + that.config.port + requestOptions.path;
                  requestOptions.payload = null; // Or query will not work
                  makeRequest(requestOptions, callback);
                  break;
              case 'POST':
                  requestOptions.path = '/objectserver/restapi/' + restOptions.path;
                  requestOptions.url = that.config.protocol + that.config.host + ':' + that.config.port + requestOptions.path;
                  requestOptions.headers['Content-Length'] = JSON.stringify(restOptions.payload).length;
                  makeRequest(requestOptions, callback);
                  break;

              case 'DELETE':
                  requestOptions.path = '/objectserver/restapi/' + restOptions.path +
                          '?filter=' + restOptions.filter;
                  requestOptions.url = that.config.protocol + that.config.host + ':' + that.config.port + requestOptions.path;
                  requestOptions.payload = null; // Or query will not work
                  makeRequest(requestOptions, callback);
                  break;

              case 'PATCH':
                  requestOptions.path = '/objectserver/restapi/' + restOptions.path +
                          '?filter=' + restOptions.filter;
                  requestOptions.url = that.config.protocol + that.config.host + ':' + that.config.port + requestOptions.path;
                  requestOptions.headers['Content-Length'] = JSON.stringify(restOptions.payload).length;
                  makeRequest(requestOptions, callback);
                  break;

              default:
          }
        });
    };

    var makeRequest = function(requestOptions, callback){
      request({
          url: requestOptions.url,
          method: requestOptions.method,
          headers: requestOptions.headers,
          body: JSON.stringify(requestOptions.payload)
      }, function (error, response, body) {

          var obj = JSON.parse(body);
          var affectedRows = 0;
          switch (requestOptions.method) {
              case 'POST' :
                  obj.rowset = {}; // no rowset return for PATCH
                  obj.rowset.rows = []; // no rows return for PATCH
                  obj.rowset.coldesc = {}; // no coldesc for PATCH
                  affectedRows = {};
                  break;
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
    }

    Connection.prototype.queryBuilder = function (sql) {
        // Converts a Objectserver SQL to REST call
        // SELECT Node, Summary FROM alerts.status where Severity > 0
        var that=this;
        return new Promise(function (resolve, reject) {

          var restOptions = {};

          restOptions.payload = {};
          restOptions.payload.rowset = {};
          restOptions.payload.rowset.coldesc = [];
          restOptions.payload.rowset.rows = [];
          restOptions.payload.rowset.rows[0] = {};

          // Get REST keyword (SELECT, UPDATE, PUT, DELETE)
          var keyword = sql.substr(0, sql.indexOf(" ")); // First word of sql string
          switch (keyword.toUpperCase()) {
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
          if (restOptions.method === 'GET')
          {
              var rexpression = new RegExp(keyword + ' ([A-Za-z0-9,\-\\s\*]+) [Ff][Rr][Oo][Mm] ');
              var colmatch = sql.match(rexpression);

              if (!colmatch) {
                  collist[1] = '*'; // No columns selected, get all
              }
              var collist = colmatch[1].replace(/ /g, ''); // Remove whitespaces
              if (collist === '*') {
                  restOptions.collist = '';
              } else {
                  restOptions.collist = encodeURI(collist);
              }
          }

          // prepare Insert
          if (restOptions.method === 'POST')
          {
              restOptions.path = '';
              var fields = '';
              var rexpression = new RegExp(keyword + ' [iI][nN][tT][oO] ([A-Za-z0-9]+\.[A-Za-z0-9]+) \((.*)\) [vV][aA][lL][uU][eE][sS]');
              var dbmatch = sql.match(rexpression);
              if (!dbmatch) {
                  // no database selected, trow error
                  throw new Error('No database selected!');
              }
              var database = dbmatch[1];
              restOptions.path = database.replace('.', '/');
              if (sql.match(database+' \(.*\) [vV][aA][lL][uU][eE][sS] \(.*\)'))
              {
                  // Where, calculate filter
                  var rexpression = new RegExp(database + ' \((.*)\) [vV][aA][lL][uU][eE][sS] \((.*)\)');
                  var fieldsmatch = sql.match(rexpression);
              } else {
                // Handle error (SQL ERROR)
              }
              // Create the rows object
              // first remove whitespaces
              var fieldsString = fieldsmatch[1].replace(/ /g, '');
              fieldsString = fieldsString.replace(/\)/g, '');
              fieldsString = fieldsString.replace(/\(/g, '');
              // get them into an array
              var fieldsArray = fieldsString.split(',');

              var fieldsValueString = fieldsmatch[3].replace(/ /g, '');
              fieldsValueString = fieldsValueString.replace(/"/g, '');
              fieldsValueString = fieldsValueString.replace(/'/g, '');
              fieldsValueString = fieldsValueString.replace(/\)/g, '');
              fieldsValueString = fieldsValueString.replace(/\(/g, '');
              // get them into array
              var fieldsValueArray = fieldsValueString.split(',');

              that.updateColumnDefinitions().then(function(){
                var loopCounter = 0; // we need to know when to send the Promise resolve
                fieldsArray.forEach(function (field,index) {
                    field = field.replace(/'/g, '');
                    var fieldName = field;
                    var fieldValue = fieldsValueArray[index];

                    var rowsItem = {};
                    rowsItem[fieldName] = fieldValue;
                    var colsItem = {
                        "type": that.collist[fieldName],
                        "name": fieldName
                    };


                    restOptions.payload.rowset.rows[0][fieldName] = fieldValue;
                    if (colsItem.type==="integer") {
                      //remove quotes from integers
                      restOptions.payload.rowset.rows[0][fieldName] = Number(restOptions.payload.rowset.rows[0][fieldName]);
                    }
                    restOptions.payload.rowset.coldesc.push(colsItem);
                    loopCounter++
                    if (loopCounter===fieldsArray.length)
                    {
                      var affectedRows = {
                        "affectedRows":0
                      }
                      restOptions.payload.rowset.affectedRows = 0;
                      resolve(restOptions);
                    }
                });
              });
          }

          // get columns and database for UPDATE
          if (restOptions.method === 'PATCH')
          {
              restOptions.path = '';
              restOptions.filter = '';
              var fields = '';
              var rexpression = new RegExp(keyword + ' ([A-Za-z0-9]+\.[A-Za-z0-9]+) [Ss][Ee][Tt] .*');
              var dbmatch = sql.match(rexpression);

              if (!dbmatch) {
                  // no database selected, trow error
                  throw new Error('No database selected!');
              }
              var database = dbmatch[1];
              restOptions.path = database.replace('.', '/');

              // get fields to be updated

              // check if sql contains 'where'
              if (sql.match('.* [Ww][Hh][Ee][Rr][Ee] .*'))
              {
                  // Where, calculate filter
                  var rexpression = new RegExp('[Ss][Ee][Tt] (.*) [Ww][Hh][Ee][Rr][Ee] (.*)');
                  var fieldsmatch = sql.match(rexpression);
              } else
              {
                  // No Where
                  restOptions.filter = '';

                  // Whithout where, get fields
                  var rexpression = new RegExp('[Ss][Ee][Tt] (.*)$');
                  var fieldsmatch = sql.match(rexpression);

              }
              // Create the rows object
              // first remove whitespaces
              var fieldsString = fieldsmatch[1].replace(/ /g, '');
              // get them into an array
              var fieldsArray = fieldsString.split(',');


              that.updateColumnDefinitions().then(function(){
                var loopCounter = 0; // we need to know when to send the Promise resolve
                fieldsArray.forEach(function (field) {
                    field = field.replace(/'/g, '');
                    var fieldObject = field.replace(/"/g, '').split('=');
                    var fieldName = fieldObject[0];
                    var fieldValue = fieldObject[1];

                    var rowsItem = {};
                    rowsItem[fieldName] = fieldValue;
                    var colsItem = {
                        "type": that.collist[fieldName],
                        "name": fieldName
                    };


                    restOptions.payload.rowset.rows[0][fieldName] = fieldValue;
                    restOptions.payload.rowset.coldesc.push(colsItem);
                    loopCounter++
                    if (loopCounter===fieldsArray.length)
                    {
                      var affectedRows = {
                        "affectedRows":0
                      }
                      restOptions.payload.rowset.affectedRows = 0;
                      resolve(restOptions);
                    }
                });
              });
          }

          // Get REST path (database) - Only for SELECT, DELETE
          if (restOptions.method === 'GET' || restOptions.method === 'DELETE')
          {
              var rexpression = new RegExp(keyword + '.* [Ff][Rr][Oo][Mm] ([A-Za-z0-9]+\.[A-Za-z0-9]+)');
              var dbmatch = sql.match(rexpression);
              if (!dbmatch) {
                  // no database selected, trow error
                  throw new Error('No database selected!');
              }
              var database = dbmatch[1];
              restOptions.path = database.replace('.', '/');
          }


          // get REST filter - ONLY FOR GET and DELETE
          if (restOptions.method === 'GET' || restOptions.method === 'DELETE')
          {
              restOptions.orderBy = '';
              restOptions.filter = '';
              // check if sql contains 'order by'
              if (sql.match('.* [Oo][Rr][Dd][Ee][Rr] [Bb][Yy] .*'))
              {
                  var rexpression = new RegExp('.* [Ww][Hh][Ee][Rr][Ee] (.*) [Oo][Rr][Dd][Ee][Rr] [Bb][Yy].*');
                  var filtermatch = sql.match(rexpression);
                  if (!filtermatch) {
                      restOptions.filter = '';
                  } else {
                      restOptions.filter = encodeURI(filtermatch[1]);
                  }
                  // get orderby
                  var rexpression = new RegExp('.* [Oo][Rr][Dd][Ee][Rr] [Bb][Yy] (.*)');
                  var orderbymatch = sql.match(rexpression);
                  if (!orderbymatch) {
                      restOptions.orderBy = '';
                  } else {
                      restOptions.orderBy = encodeURI(orderbymatch[1]);
                  }
              } else {
                  // No order by
                  var rexpression = new RegExp('.* [Ww][Hh][Ee][Rr][Ee] (.*)$');
                  var filtermatch = sql.match(rexpression);
                  filtermatch[1] = filtermatch[1].replace(/"/g, '\'')
                  filtermatch[1] = filtermatch[1].replace(/ /g, '')
                  if (!filtermatch) {
                      restOptions.filter = '';
                  } else {
                      restOptions.filter = encodeURI(filtermatch[1]);
                  }
              }
          }
          if (restOptions.method === 'GET' || restOptions.method === 'DELETE')
          {
            // For everything exept patch, do this
            resolve(restOptions);
          }
        }); // end promise function
        //rexpression = null;
    };

    Connection.prototype.sqlCommand = function(sql, callback) {
      var that = this;
      var payload={ 'sqlcmd': sql };
      var options = {
  		   method: 'POST',
         body: JSON.stringify(payload),
  		   url: that.config.protocol+that.config.host+':'+that.config.port+'/objectserver/restapi/sql/factory/',
  		   headers: {
  		       'Authorization': this._httpAuth,
  		       'Content-Type': 'application/json',
             'Accept': 'application/json',
  		       'Content-Length': JSON.stringify(payload).length,
  		       'Host': 'localhost'
  		   }
  		};


  		request(options, function (error, response, body) {
   			 if (error) throw new Error(error);
   			 var obj = JSON.parse(body);
         var affectedRows = obj.rowset.affectedRows || 0;
         callback(error, obj.rowset.rows, affectedRows, obj.rowset.coldesc);
   	 });
   };


}()); // End
