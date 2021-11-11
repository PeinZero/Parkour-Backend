import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export let signup = async (req, res, next) => {
    const username = req.body.username;
    const phone = req.body.phone;
    const password = req.body.password;

    try {
        // if (password.matches(/"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"/)) {
        //     const error = new Error(
        //         'Password must be 8 characters long, contain at least one letter and one number!'
        //     );
        //     error.statusCode = 401;
        //     throw error;
        // }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            username,
            phone,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'User Registered!' });
    } catch (err) {
        next(err);
    }
};

export let login = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await User.findOne({ username: username });

        // Checking User email
        if (!user) {
            const error = new Error('User Not Found!');
            error.statusCode = 404;
            throw error;
        }

        // Checking User password
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong Password!');
            error.statusCode = 401;
            throw error;
        }

        // If everything checks out, send back JWT and the message we wish to send.
        // TOKEN ===================================
        const token = jwt.sign(
            {
                username: user.username,
                userId: user._id.toString()
            },
            'secretkey',
            { expiresIn: '1h' }
        );
        // TOKEN ===================================

        res.status(200).json({
            token: token,
            user: user,
            message: 'Logged in Successfully'
        });
    } catch (err) {
        next(err);
    }
};
