import jwt from "jsonwebtoken";
import pool from "../db/db.config.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken 

    if (!token) {
      if (req.headers.accept?.includes("text/html")) return res.redirect("/login");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [payload.id]
    );

    if (!result.rowCount) return res.status(401).json({ success: false, message: "User not found" });

    req.user = result.rows[0];
    next();
  } catch (error) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.redirect("/login?error=Session expired. Login again");
}
  }


export const adminGuard = (req, res, next) => {
  if (req.user?.role !== "admin") {
    if (req.headers.accept) return res.redirect("/");
    return res.status(403).json({ success: false, message: "Admin only" });
  }

  next();
};
