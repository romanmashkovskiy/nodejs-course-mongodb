const { Router } = require('express');
const Course = require('../models/course');
const authGuard = require('../middleware/auth');
const router = Router();

const mapCardItems = (card) => card.items.map(c => ({
    ...c.courseId._doc,
    id: c.courseId.id,
    count: c.count
}));

const calculatePrice = (courses) => courses.reduce((acc, c) => {
    return acc + c.price * c.count
}, 0);

router.post('/add', authGuard, async (req, res) => {
    const { user, body: { id } } = req;
    const course = await Course.findById(id);
    await user.addToCard(course);
    res.redirect('/card');
});

router.get('/', authGuard, async (req, res) => {
    const user = await req.user
        .populate('card.items.courseId')
        .execPopulate();

    const courses = mapCardItems(user.card);
    const price = calculatePrice(courses);

    res.render('card', {
        title: 'Card',
        courses,
        price,
        isCard: true
    });
});

router.delete('/remove/:id', authGuard, async (req, res) => {
    const { params: { id } } = req;

    await req.user.removeFromCard(id);

    const user = await req.user
        .populate('card.items.courseId')
        .execPopulate();

    const courses = mapCardItems(user.card);
    const price = calculatePrice(courses);

    const card = {
        courses,
        price
    };

    res.status(200).json(card);
});

module.exports = router;