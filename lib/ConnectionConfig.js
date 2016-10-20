module.exports = ConnectionConfig;


function ConnectionConfig(options) {
    this.host 			= options.host || '10.10.10.10';
    this.port			= options.port || 8080;
    this.SSLEnable  = options.SSLEnable || false;
    this.SSLRejectUnauthorized = (!options.SSLRejectUnauthorized)? false:true;
    this.user			= options.user || 'root';
    this.password		= options.password || '';
    console.log("Reject: "+this.SSLRejectUnauthorized);
}
