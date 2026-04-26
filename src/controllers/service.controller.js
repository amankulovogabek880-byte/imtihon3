import pool from "../db/db.config.js";

class ServiceController {
  getServices = async (req, res, next) => {
    try {
      const services = await pool.query("SELECT id, name FROM services ORDER BY name ASC");
      res.json({ success: true, data: services.rows });
    } catch (error) {
      next(error);
    }
  };
}

export default new ServiceController();
