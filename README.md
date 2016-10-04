# node-omnibus
node-omnibus is a client library for accessing the OMNIbus Objectserver database, from [Node.js](https://nodejs.org). It uses the Objectser er [REST API](http://www-01.ibm.com/support/knowledgecenter/SSSHTQ_8.1.0/com.ibm.netcool_OMNIbus.doc_8.1.0/omnibus/wip/api/reference/omn_api_http_httpinterface.html?lang=en) and supports IBM Tivoli Netcool OMNIbus version 7.4 and above.

> '[IBM Tivoli Netcool OMNIbus](http://www.ibm.com/software/products/ibmtivolinetcoolomnibus) provides near real-time service assurance for business infrastructure, applications, servers, network devices and protocols, internet protocols, storage and security devices' (from ibm.com)

## Installation
```
npm intall node-omnibus --save
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
```
var omnibus = require('node-omnibus');

var omnibusConnection = omnibus.createConnection({
	host		: 'omnibusHostName',
	port		: '8080',
	user		: 'root',
	password	: 'password'
	SSLEnable   : true
});
```

SSLEnable : true  # Sends request over https <br/>
SSLEnable : false # Sends request over http (default)

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

## Development
```
git clone https://github.com/FredrikLandstrom/node-omnibus.git
cd node-omnibus
npm install
```

You need a local installation of IBM Tivoli Netcool OMNIbus (IBM commercial license) with the REST interface enabled as described above.

To run the tests:
```
npm test
```

### Collaborators

* [fredriklandstrom](https://github.com/fredriklandstrom) - **Fredrik Landström**, Load System
* [vukkad-1](https://github.com/vukkad-1) - **Vuk Kadenic**, Compose IT


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
