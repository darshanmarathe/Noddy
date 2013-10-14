var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db/noddy.users.db', autoload: true });



  exports.insertUser = function(user) {
  	db.insert(user, function(err) {
  		if (err) {
  			console.log(err);
  			return;
  		};
  		console.log("user Saved");
  	});
  	
  }


  exports.getusers = function(onDone) {
  	 return db.find({}, function(err , docs) {
  	 	
  	 	onDone(docs);
  	 });
  }
  


exports.getuser = function(username ,  onDone) {
  	
     return db.find({'Email' : username}, function(err , docs) {
      
  	 	onDone(docs);
  	 });
  }


  exports.getuserByID =function(id , onDone) {
    return db.find({'_id' : id}, function(err , docs) {
      
      onDone(docs);
     });
  	 	
   
  }
  