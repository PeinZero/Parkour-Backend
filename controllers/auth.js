import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export let signup = async (req, res, next) => {
    const name = req.body.name;
    const phone = req.body.phone;
    const password = req.body.password;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
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
    const name = req.body.name;
    const password = req.body.password;

    try {
        const user = await User.findOne({ name: name });

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
                name: user.name,
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
