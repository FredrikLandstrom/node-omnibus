# Contributing Guide

Contributions are welcome and are greatly appreciated! 

## Setting up your environment

After forking node-omnibus to your own github, do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/FredrikLandstrom/node-omnibus.git

# step into local repo
cd node-omnibus

# install dependencies
npm install
```



### Running tests
The test suite runs on the omnibus-node source files.

```bash
# run the tests
npm test
```


### Local Integration tests
If you want to run local integration tests on the built files you can build node-omnibus into the /lib directory. 

```bash
# build the /lib files
npm run build
```

Never commit your own integration tests on the built version. You can put all your integration test javascript in the a .test folder, this is .gitignor:ed.
Example:
```bash
# Create the .test folder
mkdir .test
# Create the test-file for local testing
touch .test/myLocalIntegrationTest.js

# Write code and run the tests
node .test/myLocalIntegrationTest.js
```

Example .test/myLocalIntegrationTest.js

```javascript
// load the module
const omnibus = require('../lib/index.js')

// create the connection
const omnibusConnection = omnibus.createConnection({...params...})

// create your local integration tests
omnibusConnection.sqlFactory(...)
```




