import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userData, userSchema } from './model';
import { fromZodError } from 'zod-validation-error';

const prisma = new PrismaClient();
export const loginRouter = express.Router();

loginRouter.post('/login', userLogin)

//user check
async function userLogin(req: Request, res: Response) {
    try {
        const data = userSchema.safeParse(req.body);
  
      if (!data.success) {
        let errMessage: string = fromZodError(data.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
  
      const resultData: userData = data.data;
  
      if (!resultData) {
        return res.status(409).json({
          error: {
            message: "Invalid params",
          },
        });
      }
    
        // Find the user by email in the database
        const user = await prisma.user.findFirst({
          where: {
            email: resultData.email,
            password: resultData.password,
          },
        });
    
        if (!user) {
          return res.status(401).json({ error: 'Email or password is incorrect.' });
        }
    
        // Generate a JWT token for authentication
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
          },
          '84896BaSiThSiRaJsAlMaN98120',
          { expiresIn: '24h' }
        );

        return res.json({
            success : "Login successfully",
            token: token
        })
    
      } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
}