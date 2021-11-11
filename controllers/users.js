import User from '../models/user.js';
import Car from '../models/car.js';

export let registerCar = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);

        if (!user) {
            const error = new Error('User not found');
            throw error;
        }

        let car = new Car({
            carNumberPlate: req.body.carNumberPlate,
            carMake: req.body.carMake,
            carModel: req.body.carModel,
            carColor: req.body.carColor,
            prodYear: req.body.prodYear,
            carOwner: user._id
        });
        await car.save();

        res.status(201).json({
            message: 'Car registered successfully'
        });
    } catch (err) {
        next(err);
    }
};

export let getRegisteredCars = async (req, res, next) => {




    // if (car.populated) check --- DONT REMOVE THIS COMMENT
};
