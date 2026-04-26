import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator.js";

const authRouter = Router();

authRouter.post("/auth/register", validate(registerSchema), authController.register);
authRouter.post("/auth/login", validate(loginSchema), authController.login);
authRouter.post("/auth/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/auth/reset-password/:token", validate(resetPasswordSchema), authController.resetPassword);
authRouter.post("/auth/logout", authController.logout);

export default authRouter;
