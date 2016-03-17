var production_omn_mod= {
    /* PostgreSQL Database configuration */
    db: {
        name: "********",
        password: "********",
        username: "********",
        host: "********",
        port: 5432
    },
    /* Omnibus Database configuration */
    db_omnibus: {
        name: "****",
        password: "****",
        username: "****",
        host: "***.***.***.***",
        REST_port: "*******"
    },
    /* Omnibus authorization (root/root) */
    omni_authorization: 'Basic cm9vdDpyb290',
    //example, change with your own:
    sqlCmd: "UPDATE alerts.status SET Severity= 5, KPI='My KPI' WHERE EventId='My EventId' AND ControlFlag=0"
};

module.exports = production_omn_mod;
