var chai = require('chai');
var expect = require('chai').expect;
var omnibus = require('../index.js');
var sinon = require('sinon');
var sinonChai('sinon-chai');

describe('Omnibus', function() {
	it('connects to a database',function(){
		expect('Hello').to.equal('Hello');
	});
	it('insert to a database',function(){
		expect('Hello').to.equal('Hello');
	});
});

describe('SQL Formatting tests', function(){



	it('can handle * as column definition', function(){
		expect(omnibus.Connection.querybuilder('select * from alerts.status').to.equal('test'));
	});
})
