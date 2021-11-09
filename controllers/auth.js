// Package Imports
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

// Model Imports
const User = require('../models/user')

exports.signup = async (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const errors = validationResult(req)
  
    try {
        if (!errors.isEmpty()){
            const error = new Error()
            error.message = errors.array()[0].msg,
            error.statusCode = 422;
            error.data = errors.array()
            throw error;
        }
  
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });
  
      await user.save();
      res.status(201).json({ message: "User Registered!" });
    } catch (err) {
      next(err);
    }
  };

exports.login = async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({email: email})

        if(!user){
            const error = new Error("User Not Found!");
            error.statusCode = 404;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual){
            const error = new Error("Passwords do not match!");
            error.statusCode = 401;
            throw error;
        }
        
        const token = jwt.sign({ email: email }, 'secret', { expiresIn: '1h' });
        
        res.status(200).json({
            user: user, 
            message: "Logged in Successfully", 
            "token": token
        });
    }
    catch (err){
        next(err);
    }
} 
