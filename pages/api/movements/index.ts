import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const movements = await prisma.movement.findMany({
        where: {
          userId: session.user.role === "admin" ? undefined : Number(session.user.id),
        },
        include: {
          user: session.user.role === "admin" ? {
            select: {
              name: true,
            },
          } : false,
        },
        orderBy: {
          date: "desc",
        },
      });
      return res.status(200).json(movements);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      return res.status(500).json({ message: "Error al obtener movimientos" });
    }
  }

  if (req.method === "POST") {
    const { concept, amount, date, type, userId } = req.body;

    // Validaciones
    if (!concept || concept.trim().length === 0) {
      return res.status(400).json({ message: "El concepto es requerido" });
    }

    if (concept.length > 100) {
      return res.status(400).json({
        message: "El concepto no puede tener más de 100 caracteres",
      });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "El monto debe ser un número positivo",
      });
    }

    if (!date) {
      return res.status(400).json({ message: "La fecha es requerida" });
    }

    const movementDate = new Date(date);
    const today = new Date();
    if (movementDate > today) {
      return res.status(400).json({
        message: "La fecha no puede ser futura",
      });
    }

    const validTypes = ["ingreso", "egreso"];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        message: "El tipo debe ser 'ingreso' o 'egreso'",
      });
    }

    try {
      // Asegurarse de que el userId sea el correcto según el rol
      const targetUserId = session.user.role === "admin" 
        ? Number(userId) 
        : Number(session.user.id);

      // Verificar que el usuario existe
      const userExists = await prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (!userExists) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      const movementData = {
        concept: concept.trim(),
        amount: Number(amount),
        date: new Date(date),
        userId: targetUserId,
        type: validTypes.includes(type) ? type : "ingreso"
      };

      const movement = await prisma.movement.create({
        data: movementData
      });

      return res.status(201).json(movement);
    } catch (error) {
      console.error("Error al crear movimiento:", error);
      return res.status(500).json({ message: "Error al crear movimiento" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
