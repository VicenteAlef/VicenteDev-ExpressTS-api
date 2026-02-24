import type { Request, Response } from "express";
import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/roleMiddleware.js";
import { UserController } from "../controllers/UserController.js";
import { ProfileController } from "../controllers/ProfileController.js";

const adminRoutes = Router();

// Rota de publicas de login e 2FA
adminRoutes.post("/auth/login", AuthController.login);
adminRoutes.post("/auth/verify-2fa", AuthController.verify2FA);

// Rotas protegidas
adminRoutes.use(authMiddleware);

// ROTA DO PRÓPRIO PERFIL (Acessível por ROOT, ADMIN e EDITOR)
adminRoutes.put("/profile", ProfileController.update);

// ROTAS DE GESTÃO DE USUÁRIOS (Apenas ADMIN e ROOT)
adminRoutes.get("/users", requireAdmin, UserController.index);
adminRoutes.post("/users", requireAdmin, UserController.create);
adminRoutes.put("/users/:id", requireAdmin, UserController.update);
adminRoutes.patch(
  "/users/:id/status",
  requireAdmin,
  UserController.toggleStatus,
);
adminRoutes.delete("/users/:id", requireAdmin, UserController.delete);

export { adminRoutes };
