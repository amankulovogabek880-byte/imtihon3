import { Router } from "express";
import bookingController from "../controllers/booking.controller.js";
import { authMiddleware, adminGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { bookingSchema, statusSchema } from "../validators/booking.validator.js";

const bookingRouter = Router();

bookingRouter.post("/bookings", authMiddleware, validate(bookingSchema), bookingController.createBooking);
bookingRouter.get("/bookings", authMiddleware, bookingController.getMyBookings);
bookingRouter.get("/bookings/all", authMiddleware, adminGuard, bookingController.getAllBookings);
bookingRouter.patch("/bookings/:id/status", authMiddleware, adminGuard, validate(statusSchema), bookingController.updateStatus);
bookingRouter.post("/bookings/:id/status", authMiddleware, adminGuard, bookingController.updateStatus);

export default bookingRouter;
