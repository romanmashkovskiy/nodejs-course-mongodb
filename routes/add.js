const {Router} = require('express');
const {validationResult} = require('express-validator');

const Course = require('../models/course');
const authGuard = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');
const router = Router();

router.get('/', authGuard, (req, res) => {
    res.render('add', {
        title: 'Add course',
        isAdd: true
    });
});

router.post('/', authGuard, courseValidators, async (req, res) => {
    const {title, price, img} = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Add course',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title,
                price,
                img
            }
        });
    }

    const course = new Course({
        title,
        price,
        img,
        userId: req.user
    });

    try {
        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;