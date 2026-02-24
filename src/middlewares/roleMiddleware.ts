import type { Request, Response, NextFunction } from "express";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  const userRole = req.user?.role;

  // Se não for ROOT nem ADMIN, é bloqueado
  if (userRole !== "ROOT" && userRole !== "ADMIN") {
    return res.status(403).json({
      error: "Acesso negado. Apenas administradores podem realizar esta ação.",
    });
  }

  return next();
}
