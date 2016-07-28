 function DevEnv(){
    
    process.env.DBPATH = "mongodb://localhost:27017/noddydb";
    
}


 function ProdEnv(){
    
    process.env.DBPATH =  " mongodb://sa:ds@ds042379.mlab.com:42379/noddy2";

}


exports.GetEnv = function(env){
    if (env === "PROD")
        return ProdEnv;
    else
    return DevEnv;
}