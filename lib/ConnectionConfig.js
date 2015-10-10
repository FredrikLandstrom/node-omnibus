module.exports = ConnectionConfig;

function ConnectionConfig(options) {
	this.host 			= options.host || 'localhost';
	this.port			= options.port || 8080;
	this.user			= options.user || 'root';
	this.password		= options.password || '';
}