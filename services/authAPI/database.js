var fs = require('fs');
var sha256 = require('sha256');
var crypto = require('crypto');

// database info
/*
const database_api = fs.readFileSync('mongo-api.key').toString().trim();
const database_cluster = 'auth-ocxap';

const stitch = require("mongodb-stitch")
const clientPromise = stitch.StitchClientFactory.create(database_cluster);
*/

const database_name = 'auth';
const database_collection = 'user-password';

const mongo = require('mongodb');
const mongoClient = mongo.MongoClient;
const mongo_url = process.env.MONGO_URI;

const generateSalt = () => { return crypto.randomBytes(32).toString('hex'); }

/*
function init(callback) {

	console.log("Initializing the service...");

clientPromise.then(client => {

	var db = client.service('mongodb', 'mongodb-atlas').db(database_name);

	client.authenticate("apiKey", database_api).then(docs => {

	const userId = client.authedId();
	console.log("user id : " + userId);

*/

function init(callback) {

	mongoClient.connect(mongo_url, { useNewUrlParser: true }, function(err, db) {

		console.log("[MongoDB] Connected to database : " + mongo_url);

		var dbo = db.db(database_name);
		var DB = new Object();

		console.log("[MongoDB] Select database : " + database_name);

		DB.auth = (user, pass, callback) => {

			dbo.collection(database_collection)
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

		DB.hasUser = (user, callback) => {
 			dbo.collection(database_collection)
 				.count({ username: user, }, { limit: 1 })
 				.then(result => { 
 					console.log("counting " + user + " = " + result);
 					callback(result != 0); 
 				});
		};

		DB.addUser = (user, pass, callback) => {

			const salt = generateSalt();
			const hashedPass = sha256(pass + salt);

			dbo.collection(database_collection).insertOne({
				// owner_id: userId,
				username: user,
				password: hashedPass,
				salt: salt,
			}).then(() => {
				console.log("add new user: " + user);
				callback(true);
			}).catch(err => {
				console.log("[MongoDB]: " + err);
				callback(false);
			});
		};

		DB.updatePassword = (user, newpass, callback) => {

			const salt = generateSalt();
			const hashedPass = sha256(newpass + salt);

			dbo.collection(database_collection).updateOne({
				username: user,
			}, {
				// owner_id: userId,
				$set: { 
					username: user,
					password: hashedPass,
					salt: salt,
				}
			}).then(() => {
				console.log("Update Password user : " + user);
				callback(true);
			}).catch(err => {
				console.log("[MongoDB]: " + err);
				callback(false);
			});
		};

		console.log("load module database: finished");
		callback(DB);

	});

// });

}

module.exports = callback => { init(callback) };

