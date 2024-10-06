import express from "express";
import { addUser, login } from "../controllers/usersController.js";
import encrypting from "../middlewares/encrypting.js";
import decrypting from "../middlewares/decrypting.js";
const router = express.Router();
router.post("/register", encrypting, addUser);
router.post("/login", decrypting,  login);

export default router;