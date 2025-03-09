import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;
  const userId = session.user.id;
  const userRole = session.user.role;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    // Verifica si el movimiento existe y si pertenece al usuario
    const movement = await prisma.movement.findUnique({
      where: { id: Number(id) },
    });

    if (!movement) {
      return res.status(404).json({ error: "Movimiento no encontrado" });
    }

    // Si el usuario no es admin y el movimiento no le pertenece, denegar acceso
    if (userRole !== "admin" && movement.userId !== Number(userId)) {
      return res.status(403).json({ error: "No tienes permiso para acceder a este movimiento" });
    }

    if (req.method === "GET") {
      const movementWithUser = await prisma.movement.findUnique({
        where: { id: Number(id) },
        include: { user: true },
      });

      return res.status(200).json(movementWithUser);
    } 
    else if (req.method === "PUT") {
      const { amount, concept, date } = req.body;
      
      // Si es admin, puede actualizar cualquier dato incluyendo el userId
      if (userRole === "admin") {
        const { userId: targetUserId } = req.body;
        const updatedMovement = await prisma.movement.update({
          where: { id: Number(id) },
          data: { 
            amount: parseFloat(amount), 
            concept, 
            date: new Date(date),
            userId: targetUserId ? Number(targetUserId) : undefined
          },
          include: { user: true },
        });
        return res.status(200).json(updatedMovement);
      } 
      // Si es usuario normal, solo puede actualizar sus propios datos
      else {
        const updatedMovement = await prisma.movement.update({
          where: { id: Number(id) },
          data: { 
            amount: parseFloat(amount), 
            concept, 
            date: new Date(date),
          },
          include: { user: true },
        });
        return res.status(200).json(updatedMovement);
      }
    } 
    else if (req.method === "DELETE") {
      await prisma.movement.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: "Movimiento eliminado correctamente" });
    } 
    else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error al procesar la solicitud" });
  }
}