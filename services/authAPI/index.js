const express = require('express');
const router = express();
const ui = express();
const app = express();

ui.set('view engine', 'ejs');

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

// get certificate
const fs = require('fs');
const algorithm = 'RS256';
const cert = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt'), 
};

// time configuration
const tokenTimeLimit = parseInt(process.env.TOKEN_TIME_LIMIT) || (60 * 30);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// tmp: dont do this in production
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	}
	else {
		next();
	}
};

app.use(allowCrossDomain);

const verify_jwt = (token, callback) => {
	jwt.verify(
		token,
		cert.cert,
		{
			algorithms:[algorithm],
		},
		callback,
	);
};

// load database synchronously
require('./database.js')(db => {

router.post("/login", (req, res) => {

	const data = req.body;

	if (!('username' in data) || !('password' in data)) {
		res.json({
			success: 0,
			message: "No username or password",
		});
		return;
	}

	db.auth(data.username, data.password, accepted => {

		if (accepted) {
			const token = jwt.sign(
				{ 
					username: data.username,
					permission: ['normal'],
				},
				cert.key,
				{ 
					algorithm: algorithm,
					expiresIn: tokenTimeLimit,
				},
			);
			

			res.set("store-session", token);

			res.json({
				success: 1,
				message: token,
			});

		} else {

			res.json({
				success: 0,
				message: "Invalid Credential",
			});
		}
	});
});

router.get("/verify", (req, res) => {
	
	const token = req.headers.authorization;

	verify_jwt(token, (error, decoded) => {
		if (error) {
			res.json({ valid: 0, error: error, });
		} else {
			res.json({ valid: 1, message: decoded, });
		}
	});
});

// add new user
router.post("/register", (req, res) => {

	const data = req.body;
	console.log(data.username);
	console.log(data.password);
	
	if (data == undefined) {
		res.json({ success: 0, message: "No data", });
	} else if (data.username == undefined || data.username == "") {
		res.json({ success: 0, message: "No username", });
	} else if (data.password == undefined || data.password == "") {
		res.json({ success: 0, message: "No password", });
	} else {
		db.hasUser(data.username, result => {
			if (!result) {
				db.addUser(data.username, data.password, result => {
					if (result) {
						console.log("create new user : " + data.username);
						res.json({ success: 1, message: "success", });
					} else {
						res.json({ success: 0, message: "error", });
					}
				});
			} else {
				res.json({ success: 0, message: "Username is duplicated", });
			}
		});
	}
});

// update password
router.post("/update", (req, res) => {

	const data = req.body;
	if (!data) {
		res.json({ success: 0, message: "No data", });
	} else if (!data.token) {
		res.json({ success: 0, message: "No jwt token", });
	} else if (!data.username || !data.old_password || !data.new_password) {
		res.json({ success: 0, message: "No username/old_password/new_password", });
	} else {	
		verify_jwt(data.token, (error, decoded) => {

			if (error) {
				res.json({ success: 0, message: "Invalid jwt: " + error, });
			} else if (decoded.username != data.username) {
				res.json({ success: 0, message: "Cannot edit others' account", });
			} else {
				db.auth(data.username, data.old_password, accepted => {

					if (accepted) {
						db.updatePassword(data.username, data.new_password, result => {
							if (result) {
								res.json({ success: 1, message: "Successfully update password", });
							} else {
								res.json({ success: 0, message: "Something went wrong", });
							}
						});
					} else {
						res.json({ success: 0, message: "Invalid Credential", });
					}
				});
			}
		});
	}
});

app.get('/', (req, res) => res.sendStatus(200));

app.use('/auth', ui);
app.use('/api/auth', router);

const serverPort = process.env.SERVER_PORT || "8080";

app.listen(serverPort, () => {
	console.log("listening to : " + serverPort);
});

});
