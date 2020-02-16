const auth = (req, res, next) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/login#login')
    }
    next();
};

module.exports = auth;