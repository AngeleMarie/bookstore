// routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import authentication from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/register", authController.createUser);
router.post("/activate/initiate", authController.initiateAccountActivation);
router.post("/activate", authController.activateAccount);
router.post("/reset-password/initiate", authController.initiateResetPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/login", authController.loginUser);
router.post("/logout", authentication, authController.logoutUser);

export default router;
