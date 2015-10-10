exports.createConnection = function createConnection(config) {
	var Connection 			= require('./lib/Connection');
	var ConnectionConfig	= require('./lib/ConnectionConfig');

	return new Connection({config: new ConnectionConfig(config)});
}

