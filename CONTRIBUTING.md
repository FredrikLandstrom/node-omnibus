# Contributing Guide

Contributions are welcome and are greatly appreciated!

## Setting up your environment

After forking node-omnibus to your own github, do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/[YourUsername]node-omnibus.git

# step into local repo
cd node-omnibus

# name and create a new branch for your contribution. Example myNewFeature
git checkout -b myNewFeature

# install dependencies
npm install
```

### Running tests

The test suite runs on the omnibus-node source files.

```bash
# run the tests
npm test
```

If you want the tests to run on changes in sourcecode, use the watch function

```bash
# run tests on save
npm run test:watch
```

If you add new functionality, please add appropriate unit tests to the tests/ folder and test your tests so they both fail and pass depending on implementation.

To check if you have complete code coverate, run the coverage report, it should report 100% coverage.

```bash
# run converage report
npm run test:coverage
```

### Local Integration tests

If you want to run local integration tests on the built files you can build node-omnibus into the /lib directory.

```bash
# build the /lib js-files
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

Example .test/myLocalIntegrationTest.js with your built files in ../lib/\*

```javascript
// load the module
const omnibus = require('../lib/index.js')

// create the connection
const omnibusConnection = omnibus.createConnection({...params...})

// create your local integration tests
omnibusConnection.sqlFactory(...)
```

### Commit and push to your fork

Commit, see GitHub documentation

```bash
    git add
    git commit -m"commit message"
    git push -u origin myNewFeature
```

### Create a pull request

After you pushed to your local github, create a pull request from your forked copy of the project describing the change.
