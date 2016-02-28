module.exports = ConnectionConfig;

try {
    var db_config = require('../../../config/config');
    function ConnectionConfig(options) {
        this.host 			= db_config.db_omnibus.host;
        this.port			= db_config.db_omnibus.REST_port;
        this.user			= db_config.db_omnibus.username;
        this.password		= db_config.db_omnibus.password;
    }
} catch (ex) {
    console.log("Missing configuration file! Using default values.");
    function ConnectionConfig(options) {
        this.host 			= options.host || '192.168.30.129';
        this.port			= options.port || 8080;
        this.user			= options.user || 'root';
        this.password		= options.password || 'root';
    }
}