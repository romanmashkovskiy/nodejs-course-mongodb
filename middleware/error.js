const error = (req, res, next) => {
    res.status(404).render('404', {
        title: 'Page not found',
        page: req.url
    })
};

module.exports = error;