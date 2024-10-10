const Joi = require("joi")
const createError = require('../utility/create-error')
const { query } = require("express")


//joi object


// Auth path
const registerSchema = Joi.object({
    username: Joi
        .string()
        .max(50)
        .required()
        .messages({
            "string.empty": "Username is required.",
            "string.base": "Username datatype invalid.",
            "string.max": "Username should be less than 50 characters.",

        }),
    password: Joi
        .string()
        .required()
        .min(6)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~])[A-Za-z\d!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~]{1,}$/)
        .messages({
            "string.empty": "Password is required.",
            "string.base": "Password must be a string.",
            "string.min": "Password should have length between 6 to 30 characters.",
            "string.max": "Password should have length between 6 to 30 characters.",
            "string.pattern.base": "Password should be at least one upper letter, one lower letter, one number and one special symbol."
        }),
    confirmPassword: Joi
        .string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': "password does not match.",
            "string.empty": "Confirm password is required.",
        }),

    email: Joi
        .string()
        .email({ tlds: false })
        .required()
        .messages({
            "string.empty": "Email is required.",
            "string.base": "Email datatype must be a string.",
            "string.email": "Email must be valid."
        }),
    displayName: Joi
        .string()
        .max(30)
        .allow('', null)
        .optional()
        .messages({
            "string.base": "Display name must be a string.",
            "string.max": "Display name cannot be longer than 30 characters."
        }),
})

const loginSchema = Joi.object({
    username: Joi
        .string()
        .required()
        .messages({
            "string.empty": "Username is required.",
            "string.base": "Username invalid."
        }),
    password: Joi
        .string()
        .required()
        .messages({
            "string.empty": "Password is required.",
            "string.base": "Password invalid."
        }),
})

const updateSchema = Joi.object({
    displayName: Joi
        .string()
        .max(30)
        .optional()
        .messages({
            "string.base": "Display name must be a string.",
            "string.max": "Display cannot be longer than 30 characters."
        }),
    email: Joi
        .string()
        .email({ tlds: false })
        .optional()
        .messages({
            "string.empty": "Email can't be null.",
            "string.base": "Email must be a string.",
            "string.email": "Email must be valid."
        }),



})


// Collection path
const getCollectionSchema = Joi.object({
    limit: Joi
        .number()
        .integer()
        .min(1)
        .default(10)
        .messages({
            "number.base": "Limit must be a number.",
            "number.min": "Limit must be greater than 0.",
        }),
    page: Joi
        .number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            "number.base": "Page must be a number.",
            "number.min": "Page must be greater than or equal to 1.",
        }),
    author: Joi
        .number()
        .integer()
        .min(1)
        .optional()
        .messages({
            "string.base": "Author ID must be a string.",
        }),
    order: Joi
        .string()
        .valid('asc', 'desc')
        .default('asc')
        .messages({
            "any.only": "Order must be either 'asc' or 'desc'."
        }),
});

const createCollectionSchema = Joi.object({
    title: Joi
        .string()
        .max(50)
        .required()
        .messages({
            "string.base": "Title must be a string.",
            "string.empty": "Title is required.",
            "string.max": "Title cannot be longer than 50 characters."
        }),
    description: Joi
        .string()
        .optional()
        .allow(null, '')
        .messages({
            "string.base": "Description must be a string."
        }),
    words: Joi
        .array()
        .items(Joi
            .string()
            .max(100)
            .required()
            .messages({
                "string.base": "All word must be a string.",
                "string.empty": "All words are required.",
                "string.max": "All words cannot be longer than 100 characters."
            }))
        .min(10)
        .required()
        .messages({
            "array.base" : "Words must be an array",
            "array.empty" : "Words are required",
            "array.min" : "Words array cannot be shorter than 10 items",
        })
})

const updateCollectionSchema = Joi.object({
    title: Joi
        .string()
        .max(50)
        .optional()
        .messages({
            "string.base": "Title must be a string.",
            "string.empty": "Title is required.",
            "string.max": "Title cannot be longer than 50 characters."
        }),
    description: Joi
        .string()
        .optional()
        .allow(null, '')
        .messages({
            "string.base": "Description must be a string."
        }),
    words: Joi
        .array()
        .items(Joi
            .string()
            .max(100)
            .required()
            .messages({
                "string.base": "All word must be a string.",
                "string.empty": "All words are required.",
                "string.max": "All words cannot be longer than 100 characters."
            }))
        .min(10)
        .optional()
        .messages({
            "array.base" : "Words must be an array",
            "array.empty" : "Words are required",
            "array.min" : "Words array cannot be shorter than 10 items",
        })
})

//validate function
const validateSchema = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.body)
    if (error) {
        return createError(400, error.details[0].message)
    }
    req.input = value
    next();
}

const validateQuery = (schema) => (req, res, next) => {
    const { value, error } = schema.validate(req.query)
    if (error) {
        return createError(400, error.details[0].message)
    }
    req.input = value
    next();
}



//Export
module.exports.registerValidator = validateSchema(registerSchema)
module.exports.loginValidator = validateSchema(loginSchema)
module.exports.updateValidator = validateSchema(updateSchema)
module.exports.getCollectionValidator = validateQuery(getCollectionSchema)
module.exports.createCollectionValidator = validateSchema(createCollectionSchema)
module.exports.updateCollectionValidator = validateSchema(updateCollectionSchema)