const prisma = require("../config/prisma")
const createError = require("../utility/create-error")
const cloudinary =require("../config/cloudinary")
const fs =require("fs/promises")
const getPublicId =require("../utility/getPublicId")
const { type } = require("os")


module.exports.getCollection = async(req,res,next)=>{
    try{
        // Obj Deconstruction
        const {limit,page,order,author} = req.input


        // create condition
        let condition = {
            orderBy: {
                updatedAt : order
            },
            skip : (page-1)*limit,
            take : limit,
            include : {
                words : {
                    select : {
                        word : true
                    }
                }
            }
        }
        if(author){
            condition = {where : {authorId : author},...condition}
        }


        // find in data base
        const result = await prisma.collection.findMany(condition)

        // response
        res.json(result)
    }catch(err){
        next(err);
    }
}

module.exports.createCollection = async(req,res,next)=>{
    try{
        // Get data from request
        const {title, description, words} = req.input
        const havefile = !!req.file
        const authorId = req.user.id

        // make data
        const wordsArray = words.map(el=>({word: el}))
        let data = {
            title,
            description,
            authorId,
            words : {
                create : wordsArray,
            }
        }

        // file handle
        let uploadResult = {}
        if(havefile){
            uploadResult = await cloudinary.uploader.upload(req.file.path,{
                public_id : req.file.filename.split(".")[0]
            })
            fs.unlink(req.file.path)
            data = {...data,coverImage : uploadResult.secure_url}
        }



        // create data
        const result = await prisma.collection.create({
            data,
            include : {
                words : {
                    select : {
                        id : true,
                        word : true
                    }
                }
            }
        })
        res.json(result)
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

module.exports.deleteCollection = async(req,res,next)=>{
    try{
        // Deconstruction
        const {id} = req.params
        const user = req.user

        // Check collection exist
        const collection = await prisma.collection.findUnique({
            where : {
                id : +id
            }
        })
        if(!collection)return createError(400,"Collection not found")
        
        // Check user permission
        if(user.role !== 'ADMIN'){
            if(user.id !== collection.userId ){
                return createError(400,"You don't have permission")
            }
        }

        // Delete then response
        const result = await prisma.collection.delete({
            where : {
                id : +id
            }
        })
        res.json(result)
    }catch(err){
        next(err);
    }
}
