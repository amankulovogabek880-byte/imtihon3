import bcrypt from "bcrypt";
import pool from "../db/db.config.js";

export const startData = async () => {
  const services = ["Oil change", "Repair", "Car wash", "Brake check", "Engine diagnostics"];

  for (const name of services) {
    await pool.query(
      `INSERT INTO services (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    );
  }

  const admin = await pool.query("SELECT id FROM users WHERE email = $1", ["admin@example.com"]);

  if (!admin.rowCount) {
    const password = await bcrypt.hash("Admin123!", 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      ["Admin", "admin@example.com", password, "admin"]
    );
  }
};
