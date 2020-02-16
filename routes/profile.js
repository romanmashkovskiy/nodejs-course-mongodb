const {Router} = require('express');

const authGuard = require('../middleware/auth');

const router = Router();

router.get('/', authGuard, (req, res) => {
    res.render('profile', {
        title: 'Profile',
        isProfile: true,
        user: req.user.toObject(),
    });
});

router.post('/', authGuard, async (req, res) => {
    try {
        const {user, body: {name}, file} = req;

        const toChange = {
            name
        };

        if (file) {
            toChange.avatarUrl = file.path;
        }

        Object.assign(user, toChange);

        await user.save();
        res.redirect('profile');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;