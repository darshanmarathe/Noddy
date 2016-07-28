 function DevEnv(){
    
    process.env.DBPATH = "mongodb://localhost:27017/noddydb";
    
}


 function ProdEnv(){
    
    process.env.DBPATH =  "mongodb://sa:ds@ds053497.mlab.com:53497/noddydb";

}


exports.GetEnv = function(env){
    if (env === "PROD")
        return ProdEnv;
    else
    return DevEnv;
}