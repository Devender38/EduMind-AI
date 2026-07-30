import express from "express";

import {
    getProfile
} from "../controllers/user.controller";

import {
    protect
} from "../middlewares/auth.middleware";


const router = express.Router();


// Protected User Profile Route
// GET /api/user/profile

router.get(
    "/profile",
    protect,
    getProfile
);


export default router;