import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db.config.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { sendMail } from "../utils/mail.js";
import { logger } from "../utils/logger.js";
import { config } from "dotenv";
config({quiet:true})

class AuthController {
  register = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (exists.rowCount) return res.redirect("/register?error=User already exists");

      const hashedPass = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [name, email, hashedPass]
      );

      const user = result.rows[0];
      res.cookie("accessToken", generateAccessToken(user), { httpOnly: true , 
        maxAge: 15 * 60 * 1000,});
      res.cookie("refreshToken", generateRefreshToken(user), { httpOnly: true ,
         maxAge: 7 * 24 * 60 * 60 * 1000,});//

      res.redirect("/");
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      logger.info(`Login attempt: ${email}`);

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (!result.rowCount) return res.redirect("/login?error=User not found");

      const user = result.rows[0];
      const isSame= await this.#_compare(password,user.password)
      if (!isSame) return res.redirect("/login?error=Password is wrong");

     res.cookie("accessToken", generateAccessToken(user), {
     httpOnly: true,
     maxAge: 15 * 60 * 1000
   });

     res.cookie("refreshToken", generateRefreshToken(user), {
      httpOnly: true,
       maxAge: 7 * 24 * 60 * 60 * 1000
  });
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: "Refresh token required" });

      const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
      const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [payload.id]);
      if (!result.rowCount) return res.status(401).json({ success: false, message: "User not found" });

      const accessToken = generateAccessToken(result.rows[0]);
      res.cookie("accessToken", accessToken, { httpOnly: true });
      res.json({ success: true, accessToken });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

      if (!result.rowCount) return res.redirect("/forgot-password?error=User not found");

      const token = jwt.sign({ id: result.rows[0].id }, process.env.SIGNATURE_KEY, { expiresIn: "15m" });
      const link = `${process.env.BASE_URL}/reset-password/${token}`;

      await sendMail({ to: email, subject: "Reset password", text: `Reset your password: ${link}` });
      res.redirect("/forgot-password?message=Reset link sent to your email");
    } catch (error) {
      next(error);
    }
  };
  adminSeed = async () => {
    const {rows:data} = await pool.query('SELECT * FROM users;')
    if(!data || data.length == 0){
      await pool.query(`
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4) ;
            `,['Admin', process.env.ADMIN_EMAIL , process.env.ADMIN_PASS, 'ADMIN'])
          }
    return 'ADMIN SEEDED ✅'
  }


  resetPassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const payload = jwt.verify(token, process.env.SIGNATURE_KEY);
      const hashedPass = await this.#_hashPass(password)

      await pool.query("UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [hashedPass, payload.id]);//
      res.redirect("/login?message=Password updated");
    } catch (error) {
      next(error);
    }
  };
   #_hashPass = async (pass) => {
    const hash = await bcrypt.hash(pass, 10);
    return hash;
  };

  #_compare = async (originalPass, hashedPass) => {
    const isSame = await bcrypt.compare(originalPass, hashedPass);
    return isSame;
  };

  logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect("/login");
  };
}

export default new AuthController();
