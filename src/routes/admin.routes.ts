import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";

const adminRoutes = Router();

// Rota de login (Passo 1: Geração do 2FA)
adminRoutes.post("/auth/login", AuthController.login);

export { adminRoutes };
