import { UAParser } from "ua-parser-js";
import pool from "../db/db.config.js";
import { sendMail } from "../utils/mail.js";
import { logger } from "../utils/logger.js";

class BookingController {
  createBooking = async (req, res, next) => {
    try {
      const { service_id, date } = req.body;

      const serviceResult = await pool.query("SELECT id, name FROM services WHERE id = $1", [service_id]);
      if (!serviceResult.rowCount) return res.redirect("/bookings/create?error=Service not found");

      const selectedDate = new Date(date);
      if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {///sana expirelikni tekwiradi
        return res.redirect("/bookings/create?error=Choose correct future date");
      }

      const parser = new UAParser(req.headers["user-agent"] || "");
      const result = parser.getResult();

      const bookingResult = await pool.query(
        `INSERT INTO bookings (user_id, service_id, date, browser, os, device, ip, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          req.user.id,
          service_id,
          selectedDate,
          result.browser.name || "Unknown",
          result.os.name || "Unknown",
          result.device.type || "desktop",
          req.ip,
          req.headers["user-agent"] || ""
        ]
      );

      await sendMail({
        to: req.user.email,
        subject: "Booking created",
        text: `Your ${serviceResult.rows[0].name} booking was created for ${selectedDate.toLocaleString()}. Status: pending.`
      });

      logger.info(`Booking created: ${bookingResult.rows[0].id}`);
      res.redirect("/bookings");
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (req, res, next) => {
    try {
      const bookings = await pool.query(
        `SELECT b.*, s.name AS service_name
         FROM bookings b
         JOIN services s ON s.id = b.service_id
         WHERE b.user_id = $1
         ORDER BY b.date DESC`,
        [req.user.id]
      );

      res.json({ success: true, data: bookings.rows });
    } catch (error) {
      next(error);
    }
  };

  getAllBookings = async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status;
      const offset = (page - 1) * limit;

      const where = status ? "WHERE b.status = $1" : "";
      const params = status ? [status, limit, offset] : [limit, offset];

      const bookings = await pool.query(
        `SELECT b.*, u.name AS user_name, u.email AS user_email, s.name AS service_name
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         JOIN services s ON s.id = b.service_id
         ${where}
         ORDER BY b.date DESC
         LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`,
        params
      );

      const totalResult = await pool.query(
        `SELECT COUNT(*)::int AS total FROM bookings b ${where}`,
        status ? [status] : []
      );

      res.json({ success: true, page, total: totalResult.rows[0].total, data: bookings.rows });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!["pending", "confirmed", "done"].includes(status)) {
        return res.redirect("/admin?error=Wrong status");
      }

      const booking = await pool.query(
        `UPDATE bookings
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, req.params.id]
      );

      if (!booking.rowCount) return res.redirect("/admin?error=Booking not found");

      const info = await pool.query(
        `SELECT u.email, s.name AS service_name, b.status
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         JOIN services s ON s.id = b.service_id
         WHERE b.id = $1`,
        [req.params.id]
      );

      await sendMail({
        to: info.rows[0].email,
        subject: "Booking status updated",
        text: `Your ${info.rows[0].service_name} booking status is now ${info.rows[0].status}.`
      });

      logger.info(`Booking status updated: ${req.params.id} -> ${status}`);
      res.redirect("/admin");
    } catch (error) {
      next(error);
    }
  };
}

export default new BookingController();
