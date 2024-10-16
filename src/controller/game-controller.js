

module.exports.createGame = async(req,res,next)=>{
    try{
        
        res.json("Game has created")
    }catch(err){
        next(err);
    }
}