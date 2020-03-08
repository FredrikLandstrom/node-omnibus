# node-omnibus

[![npm version](https://badge.fury.io/js/node-omnibus.svg)](https://badge.fury.io/js/node-omnibus)
[![node-omnibus](https://circleci.com/gh/FredrikLandstrom/node-omnibus.svg?branch=master&style=shield)](https://circleci.com/gh/FredrikLandstrom/node-omnibus)

node-omnibus is a client library for accessing the OMNIbus Objectserver database, from [Node.js](https://nodejs.org). It uses the Objectser er [REST API](http://www-01.ibm.com/support/knowledgecenter/SSSHTQ_8.1.0/com.ibm.netcool_OMNIbus.doc_8.1.0/omnibus/wip/api/reference/omn_api_http_httpinterface.html?lang=en) and supports IBM Tivoli Netcool OMNIbus version 7.4 and above.

> '[IBM Tivoli Netcool OMNIbus](http://www.ibm.com/software/products/ibmtivolinetcoolomnibus) provides near real-time service assurance for business infrastructure, applications, servers, network devices and protocols, internet protocols, storage and security devices' (from ibm.com)

- [Installation](#installation)
- [OMNIbus rest configuration](#omnibus-rest-configuration)
- [Usage](#usage)
  - [Creating the connection](#creating-the-connection)
  - [Quick start](#quick-start)
  - [The response object](#the-response-object)
  - [The error object](#the-error-object)
  - [Querying the Objectserver (SELECT)](#querying)
  - [Deleting records (DELETE)](#delete)
  - [Updating records (UPDATE)](#update)
  - [Inserting records (INSERT)](#insert)
  - [Working with the model](#workingwithmodel)
  - [Working with the connection](#workingwithconnection)
- [Javascript syntax](#javascript-syntax)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)
- [Feedback](#feedback)
- [Trademark information](#trademark-information)

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
  url: 'http://omnihost:8080/objectserver/restapi/sql/factory',
  status: 401,
  statusText: 'Authorization Required',
  explanation: 'Check username and password'
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

<a id="querying"></a>

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

If no query parameters is sent with the request, the whole dataset will be returned.

```javascript
omnibusConnection.find().then(res => console.log); //equals select * from alerts.status
```

You can only use one filter expression. AND or OR is not supported. To use more complex queries, see [.sqlFactory](#sqlFactory)

<a id="sqlFactory"></a>

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

<a id="delete"></a>

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

You can only use one filter expression. AND or OR is not supported. To use more complex queries, see [.sqlFactory](#sqlFactory)

<a id="update"></a>

## Updating records (UPDATE)

### .update(OmnibusQueryParams)

Performs a PATCH (UPDATE) request to the objectserver with required filter and uddate query parameters. The filter parameter is required to prevent accidental update of the entire table.

```javascript
omnibusConnection
  .update({
    filter: { Node: 'omnihost' },
    update: { Node: 'new_omnihost' },
  })
  .then(res => console.log(res));

// Equals: update alerts.status (Node) values ('new_omnihost') where Node='omnihost'
```

To update every record, just provide an empty filter.

```javascript
omnibusConnection
  .update({
    filter: {},
    update: { Node: 'new_omnihost' },
  })
  .then(res => console.log(res));
```

You can only use one filter expression. AND or OR is not supported. To use more complex queries, see [.sqlFactory](#sqlFactory)

<a id="insert"></a>

## Inserting records (INSERT)

### .insert(Fields)

Preforms a POST (INSERT) request to the objectserver with required fields query parameter.

```javascript
omnibusConnection
  .insert({
    Identifier: 'insertNewRowFromNode',
    Node: 'mynode',
    Summary: 'Insert from Node',
    Severity: 5,
  })
  .then(res => console.log(res));
```

<a id="workingwithmodel"></a>

## Working with the model

When creating a connection, a data-model is always fetched from the objectserver. This model is used to create update and insert queries. The model contains all the fields and types in the objectserver.

```javascript
// alerts.status model
{
  "Identifier": "string",
  "Serial": "integer",
  "Node": "string",
  "NodeAlias": "string",
  "Manager": "string",
  "Agent": "string",
  "AlertGroup": "string",
  ...mode fields
}
```

### .syncModel()

If you during your program execution update the model in the objectserver, the local model must be synced.

```javascript
// Sync model if changed during program execution
omnibusConnection.syncModel();
```

### .getModel()

If you need to check the model you can fetch the local copy of the model.

```javascript
const myModel = omnibusConnection.getModel();
```

<a id="workingwithconnection"></a>

## Working with the connection

### .setAttributes(Parameters)

If you during your program execution need to update any connection parameters.

```javascript
// update the host parameter for the objectserver
omnibusConnection.setAttributes({ host: 'new_omnihost' });

// update the host and port parameter for the objectserver
omnibusConnection.setAttributes({ host: 'new_omnihost', port: '8081' });
```

_Parameters user, password, host and port are required and cannot be empty_

### .getAttributes()

Returns the current set attributes for the connetion.

```javascript
// fetch the connection attributes
const myAttributes = omnibusConnection.getAttributes();
```

### .setQueryPath(Endpoint)

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

### .getUrl()

Returns the last used URL to communicate with the Objectserver

```javascript
const myURL = omnibusConnection.getUrl();
```

## Javascript Syntax

### Arrow Functions

This manual uses the new ES6 Arrow functions but if you prefer to use the old style, use the example below

```javascript
omnibusConnection.find(res => console.log(res)).catch(err => console.log(err));
```

```javascript
omnibusConnection
  .find(function(res) {
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
```

### Async / Await

Allthough this manual use .then().catch() for some operations feel free to use async/await where appropriate.

```javascript
// using .then()
function getAlertsAlertsStatus() {
  omnibusConnection.find().then(res, function() {
    return res;
  });
}

// using ES8 async/await
async function getAlertsStatus() {
  return await omnibusConnection.find();
}
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
