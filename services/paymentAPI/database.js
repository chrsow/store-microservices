var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://103.233.194.200:4040";
var url = process.env.MONGO_URI || "mongodb://localhost:27017";
console.log(url);

module.exports.getCash = function getCash(username) {
    console.log('getcash');
    return MongoClient.connect(url).then(function (db) {
        var dbo = db.db("unix_cash");
        return dbo.collection("cash").findOne({ username: username });
    }).then(function (result) {
        return result;
    }).catch();
}

module.exports.addCash = function addCash(username, cash) {
    console.log('addcash');
    MongoClient.connect(url, function (err, db) {
        var dbo = db.db("unix_cash");
        dbo.collection("cash").findOne({ username: username }, function (err, result) {
            if (err) throw err;
            if (result) {
                var newvalues = { $set: { username: username, cash: result.cash + cash } };
                dbo.collection("cash").updateOne({ username: username }, newvalues, function (err, res) {
                    if (err) throw err;
                });
            } else {
                dbo.collection("cash").insertOne({ username: username, cash: cash }, function (err, res) {
                    if (err) throw err;
                });
            }
            db.close();
        });
    });
}

module.exports.buy = function buy(username, cash) {
    console.log('buy');
    MongoClient.connect(url, function (err, db) {
        var dbo = db.db("unix_cash");
        dbo.collection("cash").findOne({ username: username }, function (err, result) {
            if (err) throw err;
            if (result) {
                var newvalues = { $set: { username: username, cash: cash } };
                dbo.collection("cash").updateOne({ username: username }, newvalues, function (err, res) {
                    if (err) throw err;
                });
            } else {
                console.log('error : no money')
            }
            db.close();
        });
    });
}







