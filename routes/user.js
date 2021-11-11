import { Router } from "express";
import isAuth from "../middleware/isAuth.js";
import { registerCar } from "../controllers/users.js";


const router = Router();

// Posts
router.post("/registerCar", isAuth, registerCar);

export default router;