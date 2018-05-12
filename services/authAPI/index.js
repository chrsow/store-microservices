const router = require('express')();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// get certificate
const fs = require('fs');
const algorithm = 'RS256';
const cert = {
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt'), 
};

// time configuration
const getTime = () => { return Math.floor(Date.now() / 1000); };
const tokenTimeLimit = parseInt(process.env.TOKEN_TIME_LIMIT) | (60 * 10);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// load database synchronously
require('./database.js')(db => {

router.post("/login", (req, res) => {

	const data = req.body;

	if (!('username' in data) || !('password' in data)) {
		res.json({
			result: "Error",
			message: "No username or password",
		});
		return;
	}

	db.auth(data.username, data.password, accepted => {

		if (accepted) {
			const token = jwt.sign(
				{ 
					iat: getTime(),
					exp: getTime() + tokenTimeLimit,
					permission: ['normal'],
				},
				cert.key,
				{ algorithm: algorithm },
			);

			res.json({
				result: "OK",
				message: token,
			});

		} else {

			res.json({
				result: "Error",
				message: "Invalid Credential",
			});
		}
	});
});

router.post("/verify", (req, res) => {
	
	const data = req.body;

	if (!data.token) {
		res.json({ error: 1, message: "No token", });
		return;
	}

	jwt.verify(
		data.token, 
		cert.cert, 
		{ 
			algorithms: [algorithm], 
			clockTimestamp: getTime(), 
		},
		(err, decoded) => {
			if (!err) {
				res.json({ error: 0, data: decoded, });
			} else {
				console.log(err);
				res.json({ error: 1, message: err, });
			}
		},
	);

});

// add new user
router.post("/register", (req, res) => {

	const data = req.body;
	console.log(data);
	if (data == undefined) {
		res.json({ success: 0, message: "No data", });
	} else if (data.username == undefined) {
		res.json({ success: 0, message: "No username", });
	} else if (data.password == undefined) {
		res.json({ success: 0, message: "No password", });
	} else {
		db.hasUser(data.username, result => {
			if (!result) {
				db.addUser(data.username, data.password, result => {
					if (result) {
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

// login ui
router.get("/login", (req, res) => {
	// res.sendFile();
});

const serverPort = process.env.SERVER_PORT | "8080";

router.listen(serverPort, () => {
	console.log("listening to : " + serverPort);
});

});
