const {Router} = require('express');
const {validationResult} = require('express-validator');

const Course = require('../models/course');
const authGuard = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');
const router = Router();

const isOwner = (course, req) => course.userId.toString() === req.user.id;

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('userId', 'email name');

        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user.id : null,

            courses: courses.map(course => course.toObject())
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id/edit', authGuard, async (req, res) => {
    try {
        if (!req.query.allow) {
            return res.redirect('/');
        }

        const course = await Course.findById(req.params.id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        res.render('course-edit', {
            title: `Edit course ${course.title}`,
            course: course.toObject()
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        res.render('course', {
            layout: 'empty',
            title: `Course ${course.title}`,
            course: course.toObject()
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/edit', authGuard, courseValidators, async (req, res) => {
    try {
        const {id, title, price, img} = req.body;

        const errors = validationResult(req);

        const course = await Course.findById(id);

        if (!errors.isEmpty()) {
            return res.status(422).render('course-edit', {
                title: `Edit course ${course.title}`,
                course: course.toObject(),
                error: errors.array()[0].msg,
            });
        }

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        course.title = title;
        course.price = price;
        course.img = img;

        await course.save();
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

router.post('/remove', authGuard, async (req, res) => {
    try {
        const {id} = req.body;

        await Course.deleteOne({
            _id: id,
            userId: req.user._id
        });
        res.redirect('/courses');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;