// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import authentication from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/register", authController.createUser);
router.post("/activate-account", authController.activateAccount);
router.post("/forgot-password", authController.initiateResetPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/login", authController.loginUser);
router.get("/logout", authentication, authController.logoutUser);

export default router;
