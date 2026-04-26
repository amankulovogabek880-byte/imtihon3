import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import { engine } from "express-handlebars";
import router from "./routes/index.router.js";
import { logger } from "./utils/logger.js";
import { config } from "dotenv";
config({quiet:true})
const app = express();
const PORT = Number(process.env.APP_PORT) || 3000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// handlebars config
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(process.cwd(), "src", "views", "layouts"),
    partialsDir: path.join(process.cwd(), "src", "views", "partials"),

    helpers: {
      formatDate: (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("en-GB");
      },

      eq: (a, b) => a === b,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "src", "views"));

// static files
app.use("/public", express.static(path.join(process.cwd(), "public")));

// routes
app.use(router);

// 404 handler
app.all("*splat", (req, res) => {
  res.status(404).render("error", {
    message: `Given URL ${req.url} not found`,
  });
});

// server start
app.listen(PORT, () => {
console.log('listening on3000 port')}
);