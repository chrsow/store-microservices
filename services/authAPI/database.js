var fs = require('fs');
var sha256 = require('sha256');
var crypto = require('crypto');

// database info
const database_api = fs.readFileSync('mongo-api.key').toString().trim();
const database_cluster = 'auth-ocxap';
const database_name = 'auth';
const database_collection = 'user';

const stitch = require("mongodb-stitch")
const clientPromise = stitch.StitchClientFactory.create(database_cluster);

const generateSalt = () => { return crypto.randomBytes(32).toString('hex'); }

function init(callback) {

	console.log("Initializing the service...");

clientPromise.then(client => {

	var db = client.service('mongodb', 'mongodb-atlas').db(database_name);

	client.authenticate("apiKey", database_api).then(docs => {

	console.log("[MongoDB Stitch] Connected to Stitch")

	const userId = client.authedId();
	console.log("user id : " + userId);

	db.auth = (user, pass, callback) => {

		db.collection(database_collection)
			.findOne({ username: user, })
			.then((result) => {
				if (result) {
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
	};

	db.hasUser = (user, callback) => {
 		db.collection(database_collection)
 			.count({ username: user, }, { limit: 1 })
 			.then(result => { 
 				console.log("counting " + user + " = " + result);
 				callback(result != 0); 
 			});
	};

	db.addUser = (user, pass, callback) => {

		const salt = generateSalt();
		const hashedPass = sha256(pass + salt);

		db.collection(database_collection).insertOne({
			owner_id: userId,
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
	};

	db.updatePassword = (user, newpass, callback) => {

		const salt = generateSalt();
		const hashedPass = sha256(newpass + salt);

		db.collection(database_collection).updateOne({
			username: user,
		}, {
			owner_id: userId,
			username: user,
			password: hashedPass,
			salt: salt,
		}).then(() => {
			console.log("Update Password user : " + user);
			callback(true);
		}).catch(err => {
			console.log("[MONGO DB]: " + err);
			callback(false);
		});
	};

	console.log("load module database: finished");
	callback(db);

	}).catch(err => { console.log("ERROR: " + err); });

});

}

module.exports = callback => { init(callback) };

