import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { makeExecutableSchema } from "@graphql-tools/schema";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

const typeDefs = `#graphql
  type Role {
    id: Int!
    name: String!
  }

  type Movement {
    id: Int!
    amount: Float!
    concept: String!
    date: String!
    userId: Int!
    user: User!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    phone: String!
    role: Role!
    movements: [Movement!]!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    movements: [Movement!]!
    movement(id: Int!): Movement
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!, phone: String!, roleId: Int!): User
    updateUser(id: Int!, name: String, email: String, phone: String, roleId: Int): User
    deleteUser(id: Int!): User
    createMovement(amount: Float!, concept: String!, date: String!, userId: Int!): Movement
    updateMovement(id: Int!, amount: Float, concept: String, date: String): Movement
    deleteMovement(id: Int!): Movement
  }
`;

const resolvers = {
  Query: {
    users: async (): Promise<User[]> => {
      return await prisma.user.findMany({
        include: { role: true, movements: true }, // Incluir movimientos
      });
    },
    user: async (_: any, { id }: { id: number }) => {
      return await prisma.user.findUnique({
        where: { id },
        include: { role: true, movements: true },
      });
    },
    movements: async () => {
      return await prisma.movement.findMany({
        include: { user: true },
      });
    },
    movement: async (_: any, { id }: { id: number }) => {
      return await prisma.movement.findUnique({
        where: { id },
        include: { user: true },
      });
    },
  },
  Mutation: {
    createUser: async (_: any, { name, email, password, phone, roleId }: { name: string; email: string; password: string; phone: string; roleId: number }) => {
      return await prisma.user.create({
        data: {
          name,
          email,
          password,
          phone,
          roleId,
        },
        include: { role: true },
      });
    },
    updateUser: async (_: any, { id, name, email, phone, roleId }: { id: number; name?: string; email?: string; phone?: string; roleId?: number }) => {
      return await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          roleId,
        },
        include: { role: true },
      });
    },
    deleteUser: async (_: any, { id }: { id: number }) => {
      return await prisma.user.delete({
        where: { id },
        include: { role: true },
      });
    },
    createMovement: async (_: any, { amount, concept, date, userId }: { amount: number; concept: string; date: string; userId: number }) => {
      return await prisma.movement.create({
        data: {
          amount,
          concept,
          date: new Date(date),
          userId,
        },
        include: { user: true },
      });
    },
    updateMovement: async (_: any, { id, amount, concept, date }: { id: number; amount?: number; concept?: string; date?: string }) => {
      return await prisma.movement.update({
        where: { id },
        data: {
          amount,
          concept,
          date: date ? new Date(date) : undefined,
        },
        include: { user: true },
      });
    },
    deleteMovement: async (_: any, { id }: { id: number }) => {
      return await prisma.movement.delete({
        where: { id },
        include: { user: true },
      });
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new ApolloServer({
  schema,
});

export default startServerAndCreateNextHandler(server);
