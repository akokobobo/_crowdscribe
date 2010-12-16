var db = require('../vendor/mysql/lib/mysql-native').createTCPClient();
db.auto_prepare = true;

db.auth("crowdscribe", "root", "pw");

this.query = function(str, cb) {
    var rows = [];
    db.query(str)
        .addListener('row', function(r) { rows.push(r); })
        .addListener('end', function() { cb(rows); });
}



