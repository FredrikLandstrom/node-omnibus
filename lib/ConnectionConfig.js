module.exports = ConnectionConfig;

try {
    var db_config = require('../production_omn_mod');
    function ConnectionConfig(options) {
        this.host 			= db_config.db_omnibus.host;
        this.port			= db_config.db_omnibus.REST_port;
        this.user			= db_config.db_omnibus.username;
        this.password		= db_config.db_omnibus.password;
    }
} catch (ex) {
    console.log("Missing configuration file! Using default values.");
}
