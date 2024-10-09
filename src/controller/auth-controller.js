const prisma = require("../config/prisma")
const bcrypt = require("bcryptjs")
const createError = require("../utility/create-error")
const jwt = require("jsonwebtoken")
const cloudinary =require("../config/cloudinary")
const fs =require("fs/promises")
const getPublicId =require("../utility/getPublicId")

module.exports.register = async(req,res,next) =>{
    try{
        // Obj Destructuring
        const {username , password, email ,displayName}= req.input

        //check username exist
        const usernameExist = await prisma.user.findUnique({
            where :{username}
        })
        if(usernameExist)return createError(400,"This username already exist")

        //check email exist
        const emailExist = await prisma.user.findUnique({
            where :{email}
        })
        if(emailExist)return createError(400,"This email already exist")

        //hash password
        const hashedPassword = await bcrypt.hash(password,10)
        const data = {
            username,
            password : hashedPassword,
            email,
            displayName,
            role : "USER"
        }
        const result = await prisma.user.create({
            data
        })
        const {password:ps,...newUser} = result
        res.json({message : "register successfully",result : newUser})
    }catch(err){
        next(err)
    }
}


module.exports.login = async(req,res,next) =>{
    try{
        // Obj Destructuring
        const {username, password} = req.input

        // check username exist and status
        const user = await prisma.user.findUnique({
            where : { username}})
        if(!user) return createError(400,"This username doesn't exist")
        if(user.status === 'BANNED' || user.status === 'INACTIVE')return createError(400,"This account has been suspended ")

        //check password
        const isPasswordMatch = await bcrypt.compare(password,user.password)
        if(!isPasswordMatch)return createError(400,"Password incorrect")

        //generate token
        const payLoad = {
            id : user.id,
            username : user.username,
        }
        const token = jwt.sign(payLoad,process.env.JWT_SR_KEY,{
            expiresIn : '30d'
        })

        // Response
        const {password:ps,status,role, ...userData} = user
        res.json({message : "Login Successfully",token,user : userData})
        }catch(err){
        next(err)
    }
}



module.exports.update = async(req,res,next) =>{
    try{
        // get data from request
        console.log(req.input)
        const {displayName , email} = req.input
        const havefile = !!req.file

        // check (can't be empty in a same time)
        if(!havefile && !displayName && !email)return createError(400,"Must have 1 data field at least")

        // file handle
        let uploadResult = {}
        if(havefile){
            uploadResult = await cloudinary.uploader.upload(req.file.path,{
                public_id : req.file.filename.split(".")[0]
            })
            fs.unlink(req.file.path)
            if(req.user.profileImage){
                cloudinary.uploader.destroy(getPublicId(req.user.profileImage))
            }
        }
        const data = havefile?
        {...req.input,profileImage : uploadResult.secure_url}
        :{...req.input}
        const rs = await prisma.user.update({
            where :{ id : req.user.id},data
        })
        res.json(rs)
    }catch(err){
        next(err)
    }
}


module.exports.getRole = async(req,res,next) =>{
    try{
        const id = req.user.id;
        const user = await prisma.user.findUnique({
            where : {
                id
            },select : {
                role : true
            }
        })
        res.json({role : user.role})
    }catch(err){
        next(err);
    }
}