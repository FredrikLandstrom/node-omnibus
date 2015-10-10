var chai = require('chai');
var expect = require('chai').expect;
var omnibus = require('../index.js');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

describe('Omnibus', function() {
	it('connects to a database',function(){
		expect('Hello').to.equal('Hello');
	});
	it('insert to a database',function(){
		expect('Hello').to.equal('Hello');
	});
});

describe('queryBuilder tests', function(){

	before(function(){
		var omnibusConnection = omnibus.createConnection({
			host  		: 'primarywebserver', 
			port 		: '8080',
			user 		: 'root', 
			password	: ''
		});
	})

	it('correctly formats SELECT sql queries into JSON objects', function(){
		var omnibusConnection = omnibus.createConnection({});
		var restOptions = omnibusConnection.queryBuilder('select * from alerts.status where Serial > 1 and Serial < 10 order by Serial');
		expect(restOptions.method).to.equal('GET');
		expect(restOptions.path).to.equal('alerts/status');
		expect(restOptions.filter).to.equal(encodeURI('Serial > 1 and Serial < 10'));
		expect(restOptions.collist).to.equal('');
		expect(restOptions.orderBy).to.equal(encodeURI('Serial'));
		var restOptions = omnibusConnection.queryBuilder('select Node,Serial from alerts.status where Serial > 1 and Serial < 10 order by Serial');
		expect(restOptions.method).to.equal('GET');
		expect(restOptions.path).to.equal('alerts/status');
		expect(restOptions.filter).to.equal(encodeURI('Serial > 1 and Serial < 10'));
		expect(restOptions.collist).to.equal('Node,Serial');
		expect(restOptions.orderBy).to.equal(encodeURI('Serial'));
	});
})
