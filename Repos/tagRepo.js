

var collections = ["tags"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(process.env.DBPATH, collections);


exports.insertTags = function(tag) {
    Private_getTag(tag , function (_tag) {
        if (_tag == null || _tag == undefined)
        {
        	db.tags.save(tag, function(err) {
          		if (err) {
          			console.log(err);
          			return;
          		};
          		console.log("tag Saved");
          	});
        }
    } );   
}



//TODO :: Need to implement the user id 
  exports.getTags = function( onDone) {
  	return db.tags.find({}, function(err , docs) {
      onDone(docs);
     });
  }


  exports.getTag = function(name  , onDone) {
    return db.tags.find({TagName : name}, function(err , docs) {
          onDone(docs[0]);
     });
  }
  
  function Private_getTag(tag  , onDone) {
    return db.tags.find({TagName : tag.TagName}, function(err , docs) {
          onDone(docs[0]);
     });
  }
  

  exports.DeleteTag = function(id , onDone) {
  
     db.tags.remove({TagName : name}, true ,function (err) {
        onDone();
    });
  }
