const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: String,
    password: {
        type: String,
        required: true
    },
    avatarUrl: String,
    resetToken: String,
    resetTokenExp: Date,
    card: {
        items: [{
            count: {
                type: Number,
                required: true,
                default: 1,
            },
            courseId: {
                type: Schema.Types.ObjectId,
                ref: 'Course'
            }
        }]
    }
});

userSchema.methods.addToCard = function(course) {
    const items = [...this.card.items];

    const index = items.findIndex(c => c.courseId.toString() === course._id.toString());

    if (index !== -1) {
        items[index].count++;
    } else {
        items.push({
            count: 1,
            courseId: course._id
        })
    }
    this.card.items = items;

    return this.save();
};

userSchema.methods.removeFromCard = function(courseId) {
    const items = [...this.card.items];

    const index = items.findIndex(c => c.courseId.toString() === courseId);

    if (items[index].count === 1) {
        items.splice(index, 1);
    } else {
        items[index].count--;
    }
    this.card.items = items;

    return this.save();
};

userSchema.methods.clearCard = function() {
    this.card.items = [];

    return this.save();
};

module.exports = model('User', userSchema);