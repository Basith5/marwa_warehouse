import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ZodError, object } from 'zod';
import { validationResult } from 'express-validator';


const prisma = new PrismaClient();

export const billingRouter = express.Router();

//Routes
billingRouter.post("/addBill", addBill);
billingRouter.get("/getBill", getBillRequest);


//#region
//add bill 
async function addBill(req: Request, res: Response) {
  try {
    const state = req.body.State;
    const products = req.body.Products;

    if (!state || !products) {
      return res.json({
        error: "Missing params required"
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products must be an array.' });
    }

    const mergedProducts = [];

    for (const product of products) {
      const mergedProduct = {
        ...state,
        ...product,
      };
      mergedProducts.push(mergedProduct);
    }

    const successMessages = [];
    const errorMessages = [];

    for (const mergedProduct of mergedProducts) {
      const existingProduct = await prisma.products.findFirst({
        where: {
          productName: mergedProduct.productName,
        },
      });

      if (existingProduct) {
        const updatedQuantity = existingProduct.quantity - mergedProduct.quantity;

        if (updatedQuantity < 0) {
          errorMessages.push(`Product ${mergedProduct.productName} out of stock`);
        } else {
          await prisma.products.update({
            where: {
              id: existingProduct.id,
            },
            data: {
              quantity: updatedQuantity,
            },
          });

          successMessages.push(`Product ${mergedProduct.productName} updated. New quantity: ${updatedQuantity}`);
        }
      } else {
        errorMessages.push(`Product ${mergedProduct.productName} not found in the products. Skipped.`);
      }
    }

    const createdReports = await prisma.reports.createMany({
      data: mergedProducts,
    });

    if (errorMessages.length === 0) {
      return res.json({
        success: successMessages,
        createdReports,
      });
    } else {
      return res.status(400).json({
        errors: errorMessages,
        success: successMessages,
        createdReports,
      });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
//#endregion

//#region
//getBill Request
async function getBillRequest(req: Request, res: Response) {
    try {
        const question = req.query.question as string;
        const page = parseInt(req.query.page as string) || 1; 
        const maxResult = parseInt(req.query.maxResult as string) || 8;

        if (!question) {
            return res.status(400).json({ error: 'Question parameter is required.' });
        }

        const skip = (page - 1) * maxResult;

        const products = await prisma.products.findMany({
            where: {
                productName: {
                    contains: question,
                },
            },
            skip, 
            take: maxResult,
        });

        if (products.length === 0) {
            return res.status(404).json({ error: 'No matching products found.' });
        }

        return res.json({ success: products });
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
//#endregion

