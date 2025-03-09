import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;
  const userId = Number(id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  if (req.method === "GET") {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roleId: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({
        ...user,
        roleId: user.roleId.toString(),
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return res.status(500).json({ message: "Error al obtener usuario" });
    }
  }

  if (req.method === "PUT") {
    const { name, email, phone, roleId } = req.body;

    try {
      // Validaciones
      if (!name || !email || !phone || !roleId) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      // Verificar si el email ya existe (excluyendo el usuario actual)
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          phone,
          roleId: Number(roleId),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          roleId: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      return res.status(500).json({ message: "Error al actualizar usuario" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.user.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      return res.status(500).json({ error: "Error al eliminar el usuario" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
