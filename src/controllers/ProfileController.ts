import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export const ProfileController = {
  // Atualizar o próprio perfil
  async update(req: Request, res: Response): Promise<Response | void> {
    try {
      // O ID vem do token JWT que o middleware injetou no req.user
      const userId = req.user?.id;
      const { name, password } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
      }

      // Prepara o objeto com os dados que serão atualizados
      const dataToUpdate: { name?: string; password?: string } = {};

      if (name) {
        dataToUpdate.name = name;
      }

      if (password) {
        // Se o usuário enviou uma nova senha, fazemos o hash antes de salvar
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      // Atualiza no banco
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true,
        },
      });

      return res.json({
        message: "Perfil atualizado com sucesso.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar o perfil." });
    }
  },
};
