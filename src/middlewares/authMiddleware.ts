import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  role: "ROOT" | "ADMIN" | "EDITOR";
  iat: number;
  exp: number;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "Token not provided" });

  const token = authHeader.replace("Bearer ", "");

  try {
    const secret = process.env.JWT_SECRET as string;

    const decoded = jwt.verify(token, secret) as unknown as TokenPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
