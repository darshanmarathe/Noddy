 function DevEnv(){
    
    process.env.DBPATH = "mongodb://sa:ds@ds053497.mongolab.com:53497/noddydb";
    
}


 function ProdEnv(){
    
    process.env.DBPATH =  "Some code changes checking on node";

}


exports.GetEnv = function(env){
    if (env === "PROD")
        return ProdEnv;
    else
    return DevEnv;
}