// Package Imports
const express = require('express');
const { body, check } = require('express-validator')

// Controller Imports
const authController = require('../controllers/auth')

// Model Imports
const User = require('../models/user')

const router = express.Router()

router.post(
    '/signup', 
    [
        body('email')
            .isEmail() 
            .withMessage('Please enter a valid email!')
            .custom((value, { req }) => {
                return User.findOne({email: value})
                    .then(userDoc => {
                        if (userDoc){
                            return Promise.reject()
                        }
                    })
                    .catch( err => {
                        if (!err.statusCode) {
                            err.statusCode = 500
                        }
                        next(err);
                    })
            })
            .withMessage('Email address already exists!')
            .normalizeEmail(),
        body('password')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{5,}$/, 'i')
            .withMessage('Password must be atleast 5 characters long, include one lowercase character, one uppercase character, and a special character.')
            .trim(),
        body('name').trim().not().isEmpty()
    ],
    authController.signup
)

router.post('/login', check('email').normalizeEmail(), authController.login)


module.exports = router