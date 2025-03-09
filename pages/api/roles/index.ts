import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Role } from "@prisma/client";
import prisma from "../../../lib/prisma";

interface CreateRoleInput {
  name: string;
}

interface ErrorWithCode extends Error {
  code?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const roles: Role[] = await prisma.role.findMany();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los roles" });
    }
  } 

  else if (req.method === "POST") {
    try {
      const { name }: CreateRoleInput = req.body;
      if (!name) return res.status(400).json({ error: "El nombre del rol es obligatorio" });

      const role: Role = await prisma.role.create({
        data: { name },
      });

      res.status(201).json(role);
    } catch (error) {
      const err = error as ErrorWithCode;
      if (err.code === "P2002") {
        res.status(400).json({ error: "El rol ya existe" });
      } else {
        res.status(500).json({ error: "Error al crear el rol" });
      }
    }
  } 
  
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
