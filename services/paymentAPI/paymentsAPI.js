var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');

var allowCrossDomain = function (req, res, next) {
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

// configure app to use bodyParser()
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// MongoDB - used by all services
if (process.env.VCAP_SERVICES) {
  var services = JSON.parse(process.env.VCAP_SERVICES);
  if (services.mongolab) {
    uri = services.mongolab[0].credentials.uri;
  } else {
    uri = process.env.MONGO_URI;
  }
} else {
  uri = process.env.MONGO_URI;
}
mongoose.connect(uri);

// Mongoose Models
var Product = require('./models/product');

// Set up /api router
var router = express.Router();

// allow cross origin
router.use(allowCrossDomain);

// import database
var database = require('./database.js');

// environment for auth , cart
var authURL = "http://localhost:8081/api/auth/";

// middleware to use for all requests (JSON)
router.use(function (req, res, next) {
  var body = JSON.stringify(req.body);
  console.log('[Request] ' + req.method + ' ' + req.url + ' - Body: ' + body);
  next();
});

/* ------------------------------------------------------------------------
--  P A Y M E N T  A P I  -------------------------------------------------------
------------------------------------------------------------------------ */

// Health Cheker
router.route('/').get(function (req, res) {
  res.json({ status: "OK" });
});

// get total price
router.route('/payment/totalprice').get(function (req, res) {
  Product.find({ inCart: true }, function (err, products) {
    if (err)
      res.send(err);
    var total = 0;
    var product;
    for (product in products) {
      total += product.price
    }
    res.json({ total: total });
  });
});

// buy product
router.route('/payment/buy').post(function (req, res) {
  var token = req.body.token;
  var option = {
    url: authURL + "verify",
    headers: {
      'Authorization': token
    }
  }
  request.get(option, function (error, response, body) {

    if (error) {
      console.log(error);
    } else {
      var user = JSON.parse(body);
      if (!user.message) res.json({ status: "ERROR", message: "invalid token or token expiration." });
      else {
        var username = user.message.username;
        database.getCash(username).then(function (user_cash) {
          var total = req.body.price;
          if (!user_cash) res.json({ status: "ERROR", message: "Don't have this username." });
          if (user_cash.cash - total < 0) res.json({ status: "ERROR", message: "insufficient funds." });
          else {
            database.buy(username, user_cash.cash - total);
            res.json({ status: "OK" });
          }
        });
      }
    }
    });
});

// add cash
router.route('/payment/addcash').post(function (req, res) {
  var token = req.headers.authorization;
  var option = {
    url: authURL + "verify",
    headers: {
      'Authorization': token
    }
  }
  request.get(option, function (error, response, body) {
    var cash = req.body.cash;
    var user = JSON.parse(body);
    if (!user.message) res.json({ status: "ERROR", message: "invalid token or token expiration." });
    else {
      if (cash <= 0) {
        res.json({ status: "ERROR", msg: "invalid value" });
      } else {
        var username = user.message.username;
        database.addCash(username, cash);
        res.json({ status: "OK" });
      }
    }
  });
});

// get cash
router.route('/payment/getcash').get(function (req, res) {
  var token = req.headers.authorization;
  var option = {
    url: authURL + "verify",
    headers: {
      'Authorization': token
    }
  }
  request.get(option, function (error, response, body) {
    var user = JSON.parse(body);
    if (!user.message) res.json({ status: "ERROR", message: "invalid token or token expiration." });
    else {
      var username = user.message.username;
      database.getCash(username).then(function (user_cash) {
        if (!user_cash) res.json({ status: "ERROR", message: "Don't have this username." });
        else {
          res.json({ status: "OK", username: username, cash: user_cash.cash });
        }
      });
    }
  });
});

// verify promotion code
router.route('/payment/verifypromotion').put(function (req, res) {
  var promotion = res.body.promotion;
  if (!promotion) {
    return res.json({ "status": "expired" });
  }
  res.json({ "status": "verified" });
});

/* ------------------------------------------------------------------------
--  S T A R T  S E R V E R  -----------------------------------------------
------------------------------------------------------------------------ */

app.use('/api', router);

// get the app environment from Cloud Foundry
var port = process.env.PORT || 8080;

// start server on the specified port and binding host
app.listen(port, function () {
  console.log("server starting on port: " + port);
});
