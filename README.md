# node-omnibus

[![npm version][npm-image]][npm-url]
[![install size][install-size-image]][install-size-url]

node-omnibus is a client library for accessing the OMNIbus Objectserver database, from [Node.js](https://nodejs.org). It uses the Objectser er [REST API](http://www-01.ibm.com/support/knowledgecenter/SSSHTQ_8.1.0/com.ibm.netcool_OMNIbus.doc_8.1.0/omnibus/wip/api/reference/omn_api_http_httpinterface.html?lang=en) and supports IBM Tivoli Netcool OMNIbus version 7.4 and above.

> '[IBM Tivoli Netcool OMNIbus](http://www.ibm.com/software/products/ibmtivolinetcoolomnibus) provides near real-time service assurance for business infrastructure, applications, servers, network devices and protocols, internet protocols, storage and security devices' (from ibm.com)

## Installation

```
npm install node-omnibus --save
```

##Arrow functions
This manual uses the new ES6 Arrow functions but if you prefere to use the old style, use the example below

**ES6 Arrow Function Example**

```javascript
omnibusConnection.find(res => console.log(res)).catch(err => console.log(err));
```

**Normal Function Example**

```javascript
omnibusConnection
  .find(function(res) {
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
```

## OMNIbus REST configuration

Open the propertyfile for the Objectserver that should provide the REST interface

```
vi $OMNIHOME/etc/NCOMS.props
```

where NCOMS is the name of the Objectserver.
Set the following parameters and restart the Objectserver

```
NRestOS.Enable: TRUE
NHttpd.EnableHTTP: TRUE
NHttpd.ListeningPort: 8080
```

## Usage

### Creating the connection

```javascript
const omnibus = require('node-omnibus');

// set connection parameters
const connectionParameters = {
  host: 'omnihost', // Required - Objectserver to connect to
  port: '8080', // Required - NHttpd.ListeningPort
  user: 'root', // Required - Objectserver username
  password: 'password', // Required - Objevtserver password
  SSLEnable: true, // Requests over https (default: false)
  SSLRejectUnauthorized: false, // Reject request if certificate is invalid (default: true)
};

// create the connection
const omnibusConnection = omnibus.createConnection(connectionParameters);
```

### Quick start

#### Simple SQL request to the objectserver

```javascript
omnibusConnection
  .sqlFactory('select * from alerts.status')
  .then(res => {
    // print the result from the query
    console.log(res);
  })
  .catch(err => {
    // console log any errors
    console.log(err);
  });
```

## The response object

A successful request returns a response object in the following JSON structure:

```json
{
  "rowset": {
    "osname": "NCOMS",
    "affectedrows": 10,
    "coldesc": [
      {
        "name": "Identifier",
        "type": "string",
        "size": 255
      },
      { ...more }
    ],
    "rows": [
      {
        "Identifier": "Switch01LinkDownPort1",
        "Serial": 12345,
        "Node": "Switch01",
        ...more
      },
      { ...more }
    ]
  }
}
```

#### Example loop on the response object

```javascript
omnibusConnection.sqlFactory('select * from alerts.status').then(res=> {
	// loop and console log Node and Summary
	res.rowset.rows.forEach(event,index){
		const {node,summary} = event
		console.log("Node: "+node+", Summary: "+summary)
	}
});

// Result:
// Node: Switch01, Summary: Port 01 Down
// ...
```

## The error object

If the query was unsuccessful the promise will reject with a error object in the following JSON structure

```javascript
{
	url: 'http://omnihost:8080/objectserver/restapi/sql/factory",
	status: 401
	statusText: 'Authorization Required'
}
```

The example above is from an authentication failure. Code to replicate authentication error:

```javascript
// Set the attribute 'password' to incorrect password
omnibusConnection.setAttributes({ password: 'wrongpassword' });

// Try the query
omnibusConnection
  .sqlFactory('select * from alerts.status')
  .then(res => {
    // Promise not resolved due to error
    console.log(res);
  })
  .catch(err => {
    // Catch promise error (reject)
    console.log(err);
  });
```

## Query Path

The default query path (database/table) is set to alerts.status but can easily be changed by the setQueryPath method on the connection object.

```javascript
// change querypath to alerts.details
omnibusConnection.setQueryPath('alerts.details');
```

You can also prepare many different connections with different query path when you create the connection.

```javascript
const statusDb = omnibus.createConnection(connectionParameters).setQueryPath('alerts.status');
const detailsDb = omnibus.createConnection(connectionParameters).setQueryPath('alerts.details');
const journalDb = omnibus.createConnection(connectionParameters).setQueryPath('alerts.journal');

// print all events
statusDb.find().then(res => console.log(res));
// print all details
detailsDb.find().then(res => console.log(res));
// print all journals
journalDb.find().then(res => console.log(res));
```

## Querying the ObjectServer (SELECT)

### .find(OmnibusQueryParams)

Performs a GET requst to the objectserver with optional query parameters.

```javascript
omnibusConnection
  .find({
    filter: { Node: 'switch01' },
    collist: ['Node', 'Severity', 'Summary'],
    orderby: { Node: 'ASC' },
  })
  .then(res => console.log(res));

// Equals: select Node, Severity, Summary from alerts.status where Node='switch01' ORDER BY Node ASC
```

You can only use one filter expression. AND or OR is not supported. To use more complex queries, see .sqlFactory

#markdown-header-test

### .sqlFactory(sqlQuery)

Performs a get request to the objectserver with an arbitrary SQL command.

```javascript
// create the query
const myQuery = 'select Node,Severity,Summary from alerts.status where Node='switch01' ORDER BY Node ASC'

// send to objectserver and print result
omnibusConnection.sqlQuery(myQuery).then(res=>{
	console.log(res);
});
```

_Note: You do not need to set a query path for .sqlFactory method._

## Deleting records (DELETE)

### .destroy(OmnibusQueryParams)

Performs a DELETE request to the objectserver with **required** filter query params. The filter parameter is required to prevent accidental deletion of the entire table.

```javascript
omnibusConnection
  .destroy({
    filter: { Node: 'switch01' },
  })
  .then(res => console.log(res));

// Equals: delete from alerts.status where Node='switch01'
```

To delete everything, just provide an empty filter.

```javascript
// WARNING: THIS WILL DELETE EVERYTHING FROM THE TABLE
omnibusConnection
  .destroy({
    filter: {},
  })
  .then(res => console.log(res));

// Equals: delete from alerts.status
```

You can only use one filter expression. AND or OR is not supported. To use more complex queries, see .sqlFactory

## Updating records (UPDATE)

### .update(Record)

You can only use one filter expression. AND or OR is not supported. To use more complex queries, see [.sqlFactory](<#user-content-.sqlFactory(sqlQuery)>)

## Adding records (INSERT)

### .insert(Record)

```
// Create a query
var query = 'DELETE from alerts.status where Severity = 1';

// Run Query
omnibusConnection.query(query,function(err,rows,numrows,coldesc){
	console.log(rows); // Returns JSON
});
```

### PATCH/UPDATE Query

```
// Create a query
var query = 'UPDATE alerts.status set Node="Server01" where Node="Server01.domain.com"';

// Run Query
omnibusConnection.query(query,function(err,rows,numrows,coldesc){
	console.log(rows); // Returns JSON
});
```

### POST/INSERT Query

```
// Create a query
var query = 'INSERT INTO alerts.status (Identifier, Node, Summary, Type) values ("Server01Injected","Server01", "New injected event", 2)';

// Run Query
omnibusConnection.query(query,function(err,rows,numrows,coldesc){
	console.log(rows); // Returns JSON
});
```

### Send SQL command to the SQLFactory

Make sure the ending ";" is in the SQL command sent to the ObjectServer

```
// Prepare the command
var sql = "delete user 'User1';";

// Run the commandFactory
omnibusConnection.sqlCommand(sql,function(err,rows,numrows,coldesc){
	console.log(rows); // Returns JSON
});
```

## Contributing

See the [Contributors Guide](/CONTRIBUTING.md)

## Changelog

See the [Changelog][changelog]

## License

This library is licensed under the [MIT License][license]

## Feedback

If you encounter any bugs or other issues, please file them in the
[issue tracker][issue-tracker]

## Trademark information

IBM Tivoli Netcool OMNIbus is a trademark of International Business Machines Corporation, registered in many jurisdictions worldwide.

[license]: LICENSE
[issue-tracker]: https://github.com/fredriklandstrom/node-omnibus/issues
[changelog]: CHANGELOG.md
[npm-image]: https://badgen.net/npm/v/node-omnibus
[npm-url]: https://www.npmjs.com/package/node-omnibus
[install-size-image]: https://flat.badgen.net/packagephobia/install/node-omnibus
[install-size-url]: https://packagephobia.now.sh/result?p=node-omnibus
