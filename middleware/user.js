const User = require('../models/user');

const user = async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    req.user = await User.findById(req.session.user._id);
    next();
};

module.exports = user;