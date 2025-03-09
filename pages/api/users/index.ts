import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ 
      error: "No autorizado",
      message: "Debe iniciar sesión para acceder a esta funcionalidad" 
    });
  }

  // GET - Listar usuarios (permitido para todos los usuarios autenticados)
  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          // No incluir password en la respuesta
        },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return res.status(500).json({ 
        error: "Error del servidor",
        message: "Error al obtener la lista de usuarios" 
      });
    }
  }

  // Verificar permisos de administrador para operaciones de escritura
  if (session.user?.role !== "admin") {
    return res.status(403).json({ 
      error: "No autorizado",
      message: "Se requieren permisos de administrador para esta operación" 
    });
  }

  // POST - Crear nuevo usuario (solo admin)
  if (req.method === "POST") {
    const { name, email, password, phone, roleId } = req.body;

    // Validar datos requeridos
    if (!name || !email || !password || !phone || !roleId) {
      return res.status(400).json({ 
        error: "Datos incompletos",
        message: "Todos los campos son obligatorios" 
      });
    }

    try {
      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: "Email duplicado",
          message: "Ya existe un usuario con este email" 
        });
      }

      // Hashear la contraseña
      const hashedPassword = await hash(password, 10);

      // Crear el usuario
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          roleId: Number(roleId),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          // No incluir password en la respuesta
        },
      });

      return res.status(201).json(newUser);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      return res.status(500).json({ 
        error: "Error del servidor",
        message: "Error al crear el usuario" 
      });
    }
  }

  // Método no permitido
  return res.status(405).json({ 
    error: "Método no permitido",
    message: `El método ${req.method} no está permitido` 
  });
}
