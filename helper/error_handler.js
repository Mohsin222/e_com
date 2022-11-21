function errorHandler(err,req,res,next){
    if(err.name=='UnauthorizedError'){
        //jwt authentication error
   return     res.status(401).json({
            message:'error in the server'
        })
    }
    if(err.name=='ValidationError'){
        //validation error
   return     res.status(401).json({
            message:err
        })
    }
    //default t0 500 server error
 return   res.status(500).json(  err )
} 
   
module.exports=errorHandler;