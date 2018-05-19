const request = require('request-json');

module.exports = function (options) {

	if (options == undefined) {
		options = {};
	}

	const url = options.auth_url  || process.env.AUTH_URI || 'http://localhost:8000';
	const client = request.createClient(url);

	return (req, res, next) => {

		const token = req.headers.authorization;
		
		console.log(token);

		client.post(
			'api/auth/verify',
			{ token: token },
			function (error, response, body) {
				if (!body) {
					console.log("cannot connect: " + url);
					res.sendStatus(403);
				} else if (body.valid) {
					next();
				} else {
					res.sendStatus(403);
				}
			}
		);
	}
}
