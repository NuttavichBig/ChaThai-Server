const prisma = require("../config/prisma")
const createError = require("../utility/create-error")
const cloudinary =require("../config/cloudinary")
const fs =require("fs/promises")
const getPublicId =require("../utility/getPublicId")


module.exports.getCollection = (req,res,next)=>{
    try{
        // const {limit , skip ,author} = req.query
        // const data =
        res.json('get collection path')
    }catch(err){
        next(err);
    }
}

module.exports.createCollection = (req,res,next)=>{
    try{
        res.json('create collection path')
    }catch(err){
        next(err);
    }
}

module.exports.updateCollection = (req,res,next)=>{
    try{
        const {id} = req.params
        res.json('update collection path with id : '+id)
    }catch(err){
        next(err);
    }
}
module.exports.deleteCollection = (req,res,next)=>{
    try{
        const {id} = req.params
        res.json('delete collection id : '+id)
    }catch(err){
        next(err);
    }
}
