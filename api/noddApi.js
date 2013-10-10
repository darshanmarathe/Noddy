var _noddRepo =  require("Repos/noddRepo")

exports.GetRecent = function(OnDone){
    _noddRepo.find({} ,  function() {
        
        OnDone();
    })
    
}




exports.Define =  function(app , routes) {
    
    app.get('api/nodds/recent' , routes.GetRecent)
}