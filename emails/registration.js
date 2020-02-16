const env = require('../config/env');

module.exports = (email) => ({
    to: email,
    from: env.EMAIL_FROM,
    subject: 'account created',
    html: `
        <h1>Welcome!</h1>
        <p>Your account was successfully created with email - ${email}</p>
        <hr/>
        <a href="${env.BASE_URL}">Course shop</a>
    `
});