var databaseUrl = "sa:ds@ds053497.mongolab.com:53497/noddydb"; // "username:password@example.com/mydb"

var collections = ["users", "nodds"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(databaseUrl, collections);



exports.insertUser = function(user) {
  	db.users.save(user, function(err , saved) {
  		if (err || !saved) {
  			console.log(err);
  			return;
  		};
  		console.log("user Saved");
  	});
  	
  }


  exports.getusers = function(onDone) {
  	 return db.users.find({}, function(err , docs) {
  	 	onDone(docs);
  	 });
  }
  


exports.getuser = function(username ,  onDone) {
     return db.users.find({'Email' : username}, function(err , docs) {
  	 	onDone(docs);
  	 });
  }


  exports.getuserByID =function(id , onDone) {
    return db.users.find({
        _id: ObjectId(id) 
        }, function(err , docs) {
      onDone(docs);
     });
  }
  