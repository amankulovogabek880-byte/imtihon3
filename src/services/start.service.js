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
};
