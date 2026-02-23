import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";

const adminRoutes = Router();

// Rota de login (Passo 1: Geração do 2FA)
adminRoutes.post("/auth/login", AuthController.login);
// Rota de verificação (Passo 2: Emissão do JWT) // <-- Nova rota
adminRoutes.post("/auth/verify-2fa", AuthController.verify2FA);

export { adminRoutes };
