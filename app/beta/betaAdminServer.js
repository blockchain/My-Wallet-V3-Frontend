var Guid = require('guid');
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database(process.env.BETA_DATABASE_PATH);

function generateKey() {
	return Guid.raw().split('-')[0];
}

function isTooLong(str, len) {
	if (str) {
		if (str.length > len) return true;
		else return false;
	}
	return false;
}

var dbActions = {};

dbActions.createTable = function() {
	db.run('CREATE TABLE betakeys (key TEXT, name TEXT, email TEXT, lastseen INT)');
};

dbActions.getAllKeys = function(callback) {
	db.all('SELECT rowid AS id, key, name, email, lastseen FROM betakeys', callback);
};

dbActions.getSortedKeys = function(sort, callback) {
	db.all('SELECT rowid AS id, key, name, email, lastseen FROM betakeys ORDER BY ' + sort, callback);
};

dbActions.doesKeyExist = function(keyName, callback) {
	if (isTooLong(keyName, 8)) {
		callback(false);
		return;
	}
	db.all('SELECT key FROM betakeys WHERE key IS "' + keyName + '"', function(err, data) {
		var exists = (data.length > 0);
		if (exists) dbActions.updateLastSeen(keyName);
		callback(exists);
	});
};

dbActions.deleteKeyById = function(keyId, callback) {
	if (isTooLong(keyId, 4)) {
		callback();
		return;
	}
	db.run('DELETE FROM betakeys WHERE rowid IS "' + keyId + '"', callback);
};

dbActions.assignNewKey = function(name, email, callback) {
	var key = generateKey();
	if (isTooLong(name, 25) || isTooLong(email, 25)) {
		callback();
		return;
	}
	db.run('INSERT INTO betakeys (key, name, email) VALUES ("' + key + '", "' + name + '", "' + email + '")', function() {
		callback(key);
	});
};

dbActions.updateLastSeen = function(keyName) {
	if (isTooLong(keyName, 8)) return;
	var now = Date.now();
	db.run('UPDATE betakeys SET lastseen=' + now + ' WHERE key IS "' + keyName + '"');
};

module.exports = dbActions;