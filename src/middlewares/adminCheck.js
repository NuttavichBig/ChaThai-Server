const createError = require("../utility/create-error");

module.exports = (req, res, next) => {
    try {
        if (req.user.role !== "ADMIN") {
            return createError(400, "Unauthorized")
        }
        next();
    } catch (err) {
        next(err);
    }
}