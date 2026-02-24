import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export const UserController = {
  // 1. Listar todos os usuários (Ocultando as senhas)
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar usuários." });
    }
  },

  // 2. Criar novo usuário (Admin ou Editor)
  async create(req: Request, res: Response): Promise<Response | void> {
    try {
      const { name, email, password, role } = req.body;

      // Impede a criação de um novo ROOT via painel
      if (role === "ROOT") {
        return res
          .status(403)
          .json({ error: "Não é permitido criar novos usuários ROOT." });
      }

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: "E-mail já cadastrado." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "EDITOR", // Padrão seguro
        },
        select: { id: true, name: true, email: true, role: true }, // Retorna sem a senha
      });

      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar usuário." });
    }
  },

  // 3. Editar usuário (Nome, E-mail, Role)
  async update(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      // Proteção para não rebaixar ou alterar um ROOT acidentalmente
      const targetUser = await prisma.user.findUnique({
        where: { id: id as string },
      });
      if (targetUser?.role === "ROOT" && req.user?.role !== "ROOT") {
        return res
          .status(403)
          .json({ error: "Apenas o ROOT pode editar o próprio ROOT." });
      }

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: { name, email, role },
        select: { id: true, name: true, email: true, role: true },
      });

      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  },

  // 4. Ativar / Desativar usuário
  async toggleStatus(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: id as string },
      });
      if (!user)
        return res.status(404).json({ error: "Usuário não encontrado." });

      if (user.role === "ROOT") {
        return res
          .status(403)
          .json({ error: "Não é possível desativar o usuário ROOT." });
      }

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, isActive: true },
      });

      return res.json({
        message: `Usuário ${updatedUser.isActive ? "ativado" : "desativado"} com sucesso.`,
        user: updatedUser,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao alterar status do usuário." });
    }
  },

  // 5. Excluir usuário
  async delete(req: Request, res: Response): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: id as string },
      });
      if (!user)
        return res.status(404).json({ error: "Usuário não encontrado." });

      if (user.role === "ROOT") {
        return res
          .status(403)
          .json({ error: "Não é possível excluir o usuário ROOT." });
      }

      await prisma.user.delete({ where: { id: id as string } });

      return res.json({ message: "Usuário excluído com sucesso." });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao excluir usuário." });
    }
  },
};
