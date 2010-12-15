var mysql = require('./vendor/mysql').createTCPClient();
db.auto_prepare = true;

db.auth("crowdscribe", "root", "pw");

this.query = function(str, cb) {
    return db.query(str).addListener('row', function(rows){ cb(rows); });
}
