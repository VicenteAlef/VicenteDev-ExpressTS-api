import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const AuthController = {
  async login(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      // 1. Verifica se o usuário existe e está ativo
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ error: "Credenciais inválidas ou usuário inativo." });
      }

      // 2. Verifica a senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciais inválidas." });
      }

      // 3. Gera código de 6 dígitos e tempo de expiração (10 minutos)
      const twoFactorCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
      const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);

      // 4. Salva o código no banco
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorCode, twoFactorExpires },
      });

      // 5. Envia o e-mail (simulado/real)
      await transporter.sendMail({
        from: '"VicenteDev - Admin" <no-reply@plataforma.com>',
        to: user.email,
        subject: "Seu código de acesso",
        // text: `Seu código de verificação é: ${twoFactorCode}. Ele expira em 10 minutos.`,
        html: `<b>Seu código de verificação é: ${twoFactorCode}</b><br>Ele expira em 10 minutos.`,
      });

      // Retorna sucesso pedindo o código (NÃO retorna o token JWT ainda)
      return res.json({
        message: "Código de verificação enviado para o seu e-mail.",
        require2FA: true,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  },
  async verify2FA(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res
          .status(400)
          .json({ error: "Email e código são obrigatórios." });
      }

      // 1. Busca o usuário
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.isActive) {
        return res
          .status(401)
          .json({ error: "Usuário não encontrado ou inativo." });
      }

      // 2. Verifica se o código bate
      if (user.twoFactorCode !== code) {
        return res
          .status(401)
          .json({ error: "Código de verificação inválido." });
      }

      // 3. Verifica se o código expirou
      if (!user.twoFactorExpires || user.twoFactorExpires < new Date()) {
        return res
          .status(401)
          .json({ error: "Código expirado. Por favor, faça login novamente." });
      }

      // 4. Limpa o código do banco de dados (já foi usado com sucesso)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorCode: null,
          twoFactorExpires: null,
        },
      });

      // 5. Gera o Token JWT
      const secret =
        process.env.JWT_SECRET || "secret_fallback_para_desenvolvimento";
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        secret,
        { expiresIn: "1d" }, // Token válido por 1 dia
      );

      // 6. Retorna os dados do usuário (removendo dados sensíveis) e o token
      const {
        password,
        twoFactorCode,
        twoFactorExpires,
        ...userWithoutSensitiveData
      } = user;

      return res.json({
        message: "Login realizado com sucesso.",
        user: userWithoutSensitiveData,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  },
};
