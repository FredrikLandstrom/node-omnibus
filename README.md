# node-omnibus
node-omnibus is a client library for accessing the OMNIbus Objectserver database, from [Node.js](https://nodejs.org). It uses the Objectser er [REST API](http://www-01.ibm.com/support/knowledgecenter/SSSHTQ_8.1.0/com.ibm.netcool_OMNIbus.doc_8.1.0/omnibus/wip/api/reference/omn_api_http_httpinterface.html?lang=en) and supports IBM Tivoli Netcool OMNIbus version 7.4 and above.

> '[IBM Tivoli Netcool OMNIbus](http://www.ibm.com/software/products/ibmtivolinetcoolomnibus) provides near real-time service assurance for business infrastructure, applications, servers, network devices and protocols, internet protocols, storage and security devices' (from ibm.com)

## Installation
```
npm intall node-omnibus --save
```

## OMNIbus REST configuration
Open the propertiesfile for the Objectserver that should provide the REST interface
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
```
//Use the variables below or input conf data to production_omn_mod.js configuration file
var omnibus = require('node-omnibus');

var omnibusConnection = omnibus.createConnection({
	host  		: 'servername',
	port 		: '8080',
	user 		: 'root',
	password	: 'password'
});

// Create a query
var query = 'SELECT Node,Serial from alerts.status order by Serial DESC';

// Run Query
omnibusConnection.query(query,function(err,rows,numrows,coldesc){
	console.log(rows); // Returns JSON
});
```
### Send sql command
...
//Complete the above steps
//Input sql command into production_omn_mod.js configuration file, then run:

omnibusConnection.sqlCommand();
...
## Development
```
git clone git@github.com:fredriklandstrom/node-omnibus.git
cd node-omnibus
npm install
```

You need a local installation of IBM Tivoli Netcool OMNIbus (IBM commercial license) with the REST interface enabled as described above.

To run the tests:
```
npm test
```

### Collaborators

* [fredriklandstrom](https://github.com/fredriklandstrom) - **Fredrik Landström**
* [vukkad-1](https://github.com/vukkad-1) - **Vuk Kadenic**


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
