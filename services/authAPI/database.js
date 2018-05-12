const database_user = "jwt-service";
const database_password = "eaN3Bne9FFe3cTr425l2AnjKzQEfNK";

const database_cluster = 'auth-ocxap';
const database_name = 'auth';
const database_collection = 'user';

const stitch = require("mongodb-stitch")
const clientPromise = stitch.StitchClientFactory.create(database_cluster);

var sha256 = require('sha256');
var crypto = require('crypto');

const generateSalt = () => { return crypto.randomBytes(32).toString('hex'); }

function init(callback) {
clientPromise.then(client => {

console.log("[MongoDB Stitch] Connected to Stitch")
var db = client.service('mongodb', 'mongodb-atlas').db(database_name);

db.auth = (user, pass, callback) => {

	console.log("logging with: " + user + " @ " + pass);

	client.login().then(docs => {
		db.collection(database_collection)
			.findOne({ username: user, })
			.then((err, result) => {
				if (err) {
					console.log("[MONGO DB]: " + err);
					callback(false);
				} else if (result) {
					const password = result.password;
					const salt = result.salt;
					console.log("authenticating user: " + user);
					callback(sha256(pass + salt) == password);
				} else {
					console.log("no record: " + user);
					callback(false);
				}
			}).catch(err => {
				console.log("[MONGO DB]: " + err);
				callback(false);
			});

	}).catch(err => { console.error(err); callback(false); });
};

db.hasUser = (user, callback) => {
 	client.login().then(docs => {
 		db.collection(database_collection)
 			.count({ username: user, }, { limit: 1 })
 			.then(result => { 
 				console.log("counting " + user + " = " + result);
 				callback(result != 0); 
 			});
 	});
};

db.addUser = (user, pass, callback) => {

	client.login().then(docs => {

		const salt = generateSalt();
		const hashedPass = sha256(pass + salt);

		db.collection(database_collection).insertOne({
			username: user,
			password: hashedPass,
			salt: salt,
		}).then(() => {
			console.log("add new user: " + user);
			callback(true);
		}).catch(err => {
			console.log("[MONGO DB]: " + err);
			callback(false);
		});

	}).catch(err => { console.error(err); callback(false); });
};

console.log("load module database: finished");
callback(db);

});
}

module.exports = callback => { init(callback) };

