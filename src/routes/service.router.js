import { Router } from "express";
import serviceController from "../controllers/service.controller.js";

const serviceRouter = Router();

serviceRouter.get("/services", serviceController.getServices);

export default serviceRouter;
