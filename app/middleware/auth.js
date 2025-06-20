
function requireLogin(req, res, next) {
    console.log('Session user:', req.user);
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
}

module.exports = requireLogin;