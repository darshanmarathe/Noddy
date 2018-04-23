

var collections = ["tags"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs")(process.env.DBPATH, collections);


exports.insertTags = function(tag,onDone) {
    Private_getTag(tag , function (_tag) {
        if (_tag == null || _tag == undefined)
        {
        	db.tags.save({TagName : tag}, function(err,docInserted) {
          		if (err) {
          			console.log(err);
          			return;
          		};
          		onDone(docInserted);
          	});
        }
    } );   
}

exports.updateTag = function (tag, onDone) {
     var id = tag._id;
    delete tag._id;
    db.tags.update({ _id: ObjectId(id) }, { $set: tag }, function (err) {

        onDone();
    });
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
  
exports.getTagById = function (_id, onDone) {
    return db.tags.find({ _id: ObjectId(_id) }, function (err, docs) {
        onDone(docs[0]);

    });
}
  exports.DeleteTagById = function(id , onDone) {
  
     db.tags.remove({ _id: ObjectId(id) }, true ,function (err) {
        onDone();
    });
  }
