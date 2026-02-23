import { Router } from "express";
import { Controller } from "../controllers/controller.js";

const router = Router();

router.get("/", Controller.hello);

export { router };
