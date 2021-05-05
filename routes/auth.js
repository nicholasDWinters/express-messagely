const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) throw new ExpressError('Username and password required', 400);
        if (await User.authenticate(username, password)) {
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token });
        } else {
            throw new ExpressError('Incorrect username or password', 400);
        }

    } catch (e) {
        return next(e);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        const user = { username, password, first_name, last_name, phone };
        if (!user) throw new ExpressError('Need to supply username, password, first name, last name, and phone', 400);
        let result = await User.register(user);
        let token = jwt.sign(result.username, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({ token });
    } catch (e) {
        next(e);
    }


})


module.exports = router;