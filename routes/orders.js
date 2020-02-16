const { Router } = require('express');
const Order = require('../models/order');
const authGuard = require('../middleware/auth');
const router = Router();

router.get('/', authGuard, async (req, res) => {
    try {
        const orders = await Order.find({ 'user.userId': req.user._id })
            .populate('user.userId');

        res.render('orders', {
            isOrders: true,
            title: 'Orders',
            orders: orders.map(o => ({
                ...o.toObject(),
                price: o.courses.reduce((total, c) => total + c.course.price * c.count, 0)
            }))
        });
    } catch (e) {
        console.log(e);
    }
});

router.post('/', authGuard, async (req, res) => {
    try {
        const user = await req.user
            .populate('card.items.courseId')
            .execPopulate();

        const courses = user.card.items.map(c => ({
            count: c.count,
            course: { ...c.courseId._doc }
        }));

        const order = new Order({
            courses,
            user: {
                name: req.user.name,
                userId: req.user
            }
        });

        await order.save();
        await user.clearCard();

        res.redirect('/orders');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;