import { Router } from "express";
import pool from "../db/db.config.js";
import { authMiddleware, adminGuard } from "../middlewares/auth.middleware.js";

const pageRouter = Router();

pageRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const bookings = await pool.query(
      `SELECT b.*, s.name AS service_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.user_id = $1
       ORDER BY b.date DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.render("home", { user: req.user, bookings: bookings.rows });
  } catch (error) {
    next(error);
  }
});

pageRouter.get("/login", (req, res) => {
  res.render("login", { error: req.query.error, message: req.query.message });
});

pageRouter.get("/register", (req, res) => {
  res.render("register", { error: req.query.error });
});

pageRouter.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { error: req.query.error, message: req.query.message });
});

pageRouter.get("/reset-password/:token", (req, res) => {
  res.render("reset-password", { token: req.params.token });
});

pageRouter.get("/bookings/create", authMiddleware, async (req, res, next) => {
  try {
    const services = await pool.query("SELECT id, name FROM services ORDER BY name ASC");
    res.render("booking-form", { user: req.user, services: services.rows, error: req.query.error });
  } catch (error) {
    next(error);
  }
});

pageRouter.get("/bookings", authMiddleware, async (req, res, next) => {
  try {
    const bookings = await pool.query(
      `SELECT b.*, s.name AS service_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.user_id = $1
       ORDER BY b.date DESC`,
      [req.user.id]
    );

    res.render("my-bookings", { user: req.user, bookings: bookings.rows });
  } catch (error) {
    next(error);
  }
});

pageRouter.get("/admin", authMiddleware, adminGuard, async (req, res, next) => {
  try {
    const status = req.query.status;
    const bookings = await pool.query(
      `SELECT b.*, u.name AS user_name, u.email AS user_email, s.name AS service_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN services s ON s.id = b.service_id
       ${status ? "WHERE b.status = $1" : ""}
       ORDER BY b.date DESC`,
      status ? [status] : []
    );

    res.render("admin", { user: req.user, bookings: bookings.rows, status, error: req.query.error });
  } catch (error) {
    next(error);
  }
});

export default pageRouter;
