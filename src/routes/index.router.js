import { Router } from "express";
import pageRouter from "./page.router.js";
import authRouter from "./auth.router.js";
import serviceRouter from "./service.router.js";
import bookingRouter from "./booking.router.js";

const router = Router();

router.use(pageRouter);
router.use(authRouter);
router.use(serviceRouter);
router.use(bookingRouter);

export default router;
