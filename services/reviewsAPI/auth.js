const request = require('request');

module.exports = function (options) {

	if (options == undefined) {
		options = {};
	}

	const url = (options.auth_url  || process.env.AUTH_URI || 'http://localhost:8000') + '/api/auth/verify';

	return (req, res, next) => {

		const token = req.headers.authorization;

		console.log("authenticating from " + url + " ..."); 

		request.get({
			url: url,
			headers: req.headers,
		}, function (error, response) {
		
			if (error || !response || !response.body) {
				console.log("cannot connect: " + url);
				res.sendStatus(403);
			} else {
				var data = JSON.parse(response.body);
				if (data.valid) {
					next();
				} else {
					res.sendStatus(403);
				}
			}
		}
		);
	}
}
