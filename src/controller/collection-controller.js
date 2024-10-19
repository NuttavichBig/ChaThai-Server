const prisma = require("../config/prisma")
const createError = require("../utility/create-error")
const cloudinary = require("../config/cloudinary")
const fs = require("fs/promises")
const getPublicId = require("../utility/getPublicId")
const findCollectionById = require("../services/findCollectionById")



module.exports.getCollection = async (req, res, next) => {
    try {
        // Obj Deconstruction
        const { limit, page, order, author, sortBy, role } = req.input

        // addition validate
        if (role && author) {
            return createError(400, "Role and author can't be use at the same time")
        }

        // create condition
        let condition = {
            orderBy: {
                [sortBy]: order
            },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                coverImage: true,
                authorId: true
            }
        }
        if (author) {
            condition = { where: { authorId: author }, ...condition }
        }
        if (role) {
            condition = { ...condition, where: { author: { role: role } } }
        }


        // find in data base
        const result = await prisma.collection.findMany(condition)

        // response
        res.json(result)
    } catch (err) {
        next(err);
    }
}


module.exports.getCollectionDetail = async (req, res, next) => {
    try {
        // Destruction
        const { id } = req.params

        //validate Params
        if (isNaN(+id) || Math.trunc(+id) !== +id) {
            return createError(400, "Parameter should be integer")
        }

        // CheckExist
        const collection = await prisma.collection.findUnique({
            where: {
                id: +id
            },
            include: {
                words: {
                    select: {
                        word: true
                    }
                },
                author: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        })
        if (!collection) {
            return createError(400, "Collection does not exist")
        }

        const { authorId, ...lastResponse } = collection
        res.json(lastResponse)
    } catch (err) {
        next(err);
    }

}



module.exports.createCollection = async (req, res, next) => {
    try {
        // Get data from request
        const { title, description, words } = req.input
        const havefile = !!req.file
        const authorId = req.user.id

        // make data
        const wordsArray = words.map(el => ({ word: el }))
        let data = {
            title,
            description,
            authorId,
            words: {
                create: wordsArray,
            }
        }

        // file handle
        let uploadResult = {}
        if (havefile) {
            uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: req.file.filename.split(".")[0]
            })
            fs.unlink(req.file.path)
            data = { ...data, coverImage: uploadResult.secure_url }
        }



        // create data
        const result = await prisma.collection.create({
            data,
            include: {
                words: {
                    select: {
                        id: true,
                        word: true
                    }
                }
            }
        })
        res.json(result)
    } catch (err) {
        next(err);
    }
}


module.exports.updateCollection = async (req, res, next) => {
    try {
        // Get data from request
        const { id } = req.params
        const { title, description, words, deleteImage } = req.input
        const havefile = !!req.file

        // collection service
        const collection = await findCollectionById(id)


        // Check user permission
        if (req.user.role !== 'ADMIN') {
            if (req.user.id !== collection.authorId) {
                return createError(400, "You don't have permission")
            }
        }

        // make data
        let data = {}

        // check input
        if (title) {
            data = { ...data, title: title }
        }

        if (description || description === null || description === '') {
            data = { ...data, description: description }
        }

        // check words
        if (words) {
            const wordsArray = words.map(el => ({ word: el }))
            data = {
                ...data, words: {
                    create: wordsArray,
                }
            }
            const delWords = await prisma.word.deleteMany({
                where: {
                    collectionId: +id
                }
            })
            console.log("Delete : " + delWords)
        }

        // handle delete cover image
        if (deleteImage) {
            cloudinary.uploader.destroy(getPublicId(collection.coverImage))
            data.coverImage = null
        }


        // file handle
        if (havefile) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: req.file.filename.split(".")[0]
            })
            fs.unlink(req.file.path)
            data = { ...data, coverImage: uploadResult.secure_url }
            if (collection.coverImage) {
                cloudinary.uploader.destroy(getPublicId(collection.coverImage))
            }
        }


        // create data
        const result = await prisma.collection.update({
            where: {
                id: +id
            },
            data,
            include: {
                words: {
                    select: {
                        id: true,
                        word: true
                    }
                }
            }
        })
        res.json(result)
    } catch (err) {
        next(err);
    }
}

module.exports.deleteCollection = async (req, res, next) => {
    try {
        // Deconstruction
        const { id } = req.params
        const user = req.user

        // collection service
        const collection = await findCollectionById(id)

        // Check user permission
        if (user.role !== 'ADMIN') {
            if (user.id !== collection.authorId) {
                return createError(400, "You don't have permission")
            }
        }

        // Delete then response
        const result = await prisma.collection.delete({
            where: {
                id: +id
            }
        })
        res.json(result)
    } catch (err) {
        next(err);
    }
}
