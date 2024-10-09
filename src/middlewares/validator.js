const Joi = require("joi")
const createError = require('../utility/create-error')


//joi object


// Auth path
const registerSchema = Joi.object({
    username: Joi
        .string()
        .max(50)
        .required()
        .messages({
            "string.empty": "Username is required",
            "string.base": "Username datatype invalid",
            "string.max": "Username should be less than 50 characters",

        }),
    password: Joi
        .string()
        .required()
        .min(6)
        .max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~])[A-Za-z\d!@#$%^&*()_+=\-{}\[\]\/:;"'<>,.?`~]{1,}$/)
        .messages({
            "string.empty": "Password is required",
            "string.base": "Password datatype invalid",
            "string.min": "Password should have between 6 to 30 characters",
            "string.max": "Password should have between 6 to 30 characters",
            "string.pattern.base": "Password should be at least one upper letter, one lower letter, one number and one special symbol"
        }),
    confirmPassword: Joi
        .string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            'any.only': "password does not match",
            "string.empty": "Confirm password is required",
        }),

    email: Joi
        .string()
        .email({ tlds: false })
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.base": "Email datatype invalid",
            "string.email": "Email must be valid"
        }),
    displayName: Joi
        .string()
        .max(30)
        .allow('', null)
        .optional()
        .messages({
            "string.base": "Display name type invalid",
            "string.max": "Display name should less than 30 characters"
        }),
})

const loginSchema = Joi.object({
    username: Joi
        .string()
        .required()
        .messages({
            "string.empty": "Username is required",
            "string.base": "Username invalid"
        }),
    password: Joi
        .string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.base": "Password invalid"
        }),
})

const updateSchema = Joi.object({
    displayName: Joi
        .string()
        .max(30)
        .optional()
        .messages({
            "string.base": "Display name type invalid",
            "string.max": "Display name should less than 30 characters"
        }),
    email: Joi
        .string()
        .email({ tlds: false })
        .optional()
        .messages({
            "string.empty": "Email is required",
            "string.base": "Email datatype invalid",
            "string.email": "Email must be valid"
        }),



})


// Collection path


//validate function
const validateSchema = (schema) => (req, res, next) => {
    console.log(req.body)
    const { value, error } = schema.validate(req.body)
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