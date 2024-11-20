const prisma = require("../config/prisma")
const createError = require("../utility/create-error")
const bcrypt = require("bcryptjs")
const fs = require("fs/promises")
const cloudinary =require("../config/cloudinary")
const getPublicId =require("../utility/getPublicId")



module.exports.getUser = async (req, res, next) => {
    try {
        // Obj Deconstruction
        const { order, sortBy, limit, page, search } = req.input
        let condition = {
            orderBy: {
                [sortBy]: order
            },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id : true,
                username : true,
                displayName : true,
                email : true,
                status : true,
                createdAt : true,
                profileImage : true,
                role : true

            },
        }

        // Check for search
        if (search) {
            condition = {

                where: {
                    OR: [
                        {
                            username: {
                                contains: search,
                            }
                        },
                        {
                            email: {
                                contains: search,
                            }
                        },
                    ]
                },...condition
            }
        }

        // prisma
        const result = await prisma.user.findMany(condition)
        console.log(result)
        // response
        res.json(result)
    } catch (err) {
        next(err);
    }

}

module.exports.updateUser = async (req, res, next) => {
    try {
        // obj deconstruction
        const {email , password , status,deleteImage} =req.input
        console.log(req.input)
        const haveFile = !!req.file
        const {id} = req.params

        // Check user exist
        const user = await prisma.user.findUnique({
            where : { id : +id}})
        if(!user) return createError(400,"This user does not exist")

        // admin can only update self in auth route
        if(user.role === "ADMIN")return createError(400,"You can't update admin data")

        // check (can't be empty in a same time)
        if(!haveFile && !password && !email && !status)return createError(400,"Must have 1 data field at least")
        
        // make data
        let data = {...req.input}

               // handle delete cover image
               if (deleteImage) {
                cloudinary.uploader.destroy(getPublicId(user.profileImage))
                data.profileImage = null
            }
    
    
            // file handle
            if (haveFile) {
                const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                    public_id: req.file.filename.split(".")[0]
                })
                fs.unlink(req.file.path)
                data = { ...data, profileImage: uploadResult.secure_url }
                if (user.profileImage) {
                    cloudinary.uploader.destroy(getPublicId(user.profileImage))
                }
            }

        // hash password
        if(password){
            const hashedPassword = await bcrypt.hash(password,10)
            data.password = hashedPassword
        }

        // update then response
        const result = await prisma.user.update({
            where :{ id : +id},data, select: {
                id : true,
                username : true,
                displayName : true,
                email : true,
                status : true,
                createdAt : true,
                role : true,
                profileImage : true

            },
        })
        res.json(result)
    } catch (err) {
        console.log(err)
        next(err);
    }

}

module.exports.deleteUser = async (req, res, next) => {
    try {
        const {id} = req.params

        // Check user exist
        const user = await prisma.user.findUnique({
            where : { id : +id}})
        if(!user) return createError(400,"This user does not exist")

        // Admin can't be delete
        if(user.role === "ADMIN")return createError(400,"You can't delete admin data")

        // Check Active
        if(user.status === "ACTIVE")return createError(400,"This user still active")

        // Delete
        const result = await prisma.user.delete({
            where : { id : +id}
        })
        res.json(result)

    } catch (err) {
        next(err);
    }

}

