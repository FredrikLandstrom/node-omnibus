# node-omnibus

node-omnibus is a client library for accessing the OMNIbus Objectserver database, from [Node.js](https://nodejs.org). It uses the Objectser er [REST API](http://www-01.ibm.com/support/knowledgecenter/SSSHTQ_8.1.0/com.ibm.netcool_OMNIbus.doc_8.1.0/omnibus/wip/api/reference/omn_api_http_httpinterface.html?lang=en) and supports IBM Tivoli Netcool OMNIbus version 7.4 and above.

> '[IBM Tivoli Netcool OMNIbus](http://www.ibm.com/software/products/ibmtivolinetcoolomnibus) provides near real-time service assurance for business infrastructure, applications, servers, network devices and protocols, internet protocols, storage and security devices' (from ibm.com)

## Installation
```bash
npm intall node-omnibus --save
```

## OMNIbus REST configuration
[TODO]

## Usage
[TODO]

## Development
```bash
git clone git@github.com:fredriklandstrom/node-omnibus.git
cd node-omnibus
npm install
```

You need a local installation of IBM Tivoli Netcool OMNIbus (IBM commercial license) with the REST interface enabled as described above. 

To run the tests:
```bash
npm test
```

## Changelog
See the [Changelog][changelog]

## License
This library is licensed under the [MIT License][license]

## Feedback
If you encounter any bugs or other issues, please file them in the 
[issue tracker][issue-tracker]

##Trademark information
IBM Tivoli Netcool OMNIbus is a trademark of International Business Machines Corporation, registered in many jurisdictions worldwide.


[license]: LICENSE
[issue-tracker]: https://github.com/fredriklandstrom/node-omnibus/issues
[changelog]: CHANGELOG.md
