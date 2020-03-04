# node-omnibus
[![npm version][npm-image]][npm-url]
[![install size][install-size-image]][install-size-url]

node-omnibus is a client library for accessing the OMNIbus Objectserver database, from [Node.js](https://nodejs.org). It uses the Objectser er [REST API](http://www-01.ibm.com/support/knowledgecenter/SSSHTQ_8.1.0/com.ibm.netcool_OMNIbus.doc_8.1.0/omnibus/wip/api/reference/omn_api_http_httpinterface.html?lang=en) and supports IBM Tivoli Netcool OMNIbus version 7.4 and above.

> '[IBM Tivoli Netcool OMNIbus](http://www.ibm.com/software/products/ibmtivolinetcoolomnibus) provides near real-time service assurance for business infrastructure, applications, servers, network devices and protocols, internet protocols, storage and security devices' (from ibm.com)

## Installation
```
npm install node-omnibus --save
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
	host		: 'omnihost',	// Required - Objectserver to connect to
	port		: '8080',	// Required - NHttpd.ListeningPort
	user		: 'root',	// Required - Objectserver username
	password	: 'password',	// Required - Objevtserver password
	SSLEnable	: true,		// Requests over https (default: false)
	SSLRejectUnauthorized : false	// Reject request if certificate is invalid (default: true)
}

// create the connection
const omnibusConnection = omnibus.createConnection(connectionParameters)
```

### Quick start
#### Simple SQL request to the objectserver
```javascript
omnibusConnection.sqlFactory('select * from alerts.status').then(res=> {
	// print the result from the query
	console.log(res);
}).catch(err => {
	// console log any errors
	console.log(err);
})
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
			{ ... },
		],
		"rows": [
			{
				"Identifier": "Switch01LinkDownPort1",
				"Serial": 12345,
				"Node": "Switch01",
				...   
			},
			{ ... }
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

### SELECT Query
```
// Create a query
var query = 'SELECT Node,Serial from alerts.status order by Serial DESC';

// Run Query
omnibusConnection.query(query,function(err,rows,numrows,coldesc){
	console.log(rows); // Returns JSON
});
```

### DELETE Query
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