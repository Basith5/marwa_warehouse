import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ZodError, object } from 'zod';

const prisma = new PrismaClient();

export const loginRouter = express.Router();