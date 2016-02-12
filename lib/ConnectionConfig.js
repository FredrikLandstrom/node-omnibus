module.exports = ConnectionConfig;

function ConnectionConfig(options) {
	this.host 			= options.host || '192.168.30.129';
	this.port			= options.port || 8080;
	this.user			= options.user || 'root';
	this.password		= options.password || 'root';
}