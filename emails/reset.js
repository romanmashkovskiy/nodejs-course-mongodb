const env = require('../config/env');

module.exports = (email, token) => ({
    to: email,
    from: env.EMAIL_FROM,
    subject: 'reset password',
    html: `
        <h1>Forgot password?</h1>
        <p>Press link below:</p>
        <p><a href="${env.BASE_URL}/auth/password/${token}">Reset password</a></p>
        <hr/>
        <a href="${env.BASE_URL}">Course shop</a>
    `
});