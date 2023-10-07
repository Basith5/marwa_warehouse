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
// async function addBill(req: Request, res: Response) {
//   try {
//     const state = req.body.State;
//     const products = req.body.Products;

//     if (!state || !products) {
//       return res.json({
//         error: "Missing params required"
//       });
//     }

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     if (!Array.isArray(products)) {
//       return res.status(400).json({ error: 'Products must be an array.' });
//     }

//     // Fetch the last invoice number from the database
//     const lastInvoice = await prisma.reports.findFirst({
//       orderBy: {
//         invoiceNumber: 'desc',
//       },
//       select: {
//         invoiceNumber: true,
//       },
//     });

//     // Calculate the current invoice number
//     const currentInvoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

//     const successMessages = [];
//     const errorMessages = [];

//     for (const product of products) {
//       const existingProduct = await prisma.products.findFirst({
//         where: {
//           productName: product.productName,
//         },
//       });

//       if (existingProduct) {
//         const updatedQuantity = existingProduct.quantity - product.quantity;

//         if (updatedQuantity < 0) {
//           errorMessages.push(`Product ${product.productName} out of stock`);
//         } else {
//           // Only create the report entry if the product exists and has sufficient stock
//           const mergedProduct = {
//             ...state,
//             ...product,
//             invoiceNumber: currentInvoiceNumber,
//           };

//           await prisma.reports.create({
//             data: mergedProduct,
//           });

//           // Update the product quantity in the database
//           await prisma.products.update({
//             where: {
//               id: existingProduct.id,
//             },
//             data: {
//               quantity: updatedQuantity,
//             },
//           });

//           successMessages.push(`Product ${product.productName} updated. New quantity: ${updatedQuantity}`);
//         }
//       } else {
//         errorMessages.push(`Product ${product.productName} not found in the products. Skipped.`);
//       }
//     }

//     if (errorMessages.length === 0) {
//       return res.json({
//         success: successMessages,
//         invoiceNumber: currentInvoiceNumber,
//       });
//     } else {
//       return res.status(400).json({
//         errors: errorMessages,
//         success: successMessages,
//         invoiceNumber: currentInvoiceNumber,
//       });
//     }
//   } catch (error) {
//     console.error('An error occurred:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// }
async function addBill(req: Request, res: Response) {
  try {
    const state = req.body.State;
    const products = req.body.Products;

    if (!state || !products) {
      return res.json({
        error: "Missing params required",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Products must be an array.' });
    }

    // Fetch the last invoice number from the database
    const lastInvoice = await prisma.reports.findFirst({
      orderBy: {
        invoiceNumber: 'desc',
      },
      select: {
        invoiceNumber: true,
      },
    });

    // Calculate the current invoice number
    const currentInvoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    const errorMessages = [];
    let outOfStockOccurred = false; // Flag to track if out of stock occurred
    let productNotFoundOccurred = false; // Flag to track if product not found occurred

    for (const product of products) {
      const existingProduct = await prisma.products.findFirst({
        where: {
          productName: product.productName,
        },
      });

      if (existingProduct) {
        const updatedQuantity = existingProduct.quantity - product.quantity;

        if (updatedQuantity < 0) {
          if (!outOfStockOccurred) {
            errorMessages.push('Some products are out of stock.');
            outOfStockOccurred = true; // Set the flag to true
          }
        } else {
          // Only create the report entry if the product exists and has sufficient stock
          const mergedProduct = {
            ...state,
            ...product,
            invoiceNumber: currentInvoiceNumber,
          };

          await prisma.reports.create({
            data: mergedProduct,
          });

          // Update the product quantity in the database
          await prisma.products.update({
            where: {
              id: existingProduct.id,
            },
            data: {
              quantity: updatedQuantity,
            },
          });
        }
      } else {
        if (!productNotFoundOccurred) {
          errorMessages.push('Some products were not found in the products. Skipped.');
          productNotFoundOccurred = true; // Set the flag to true
        }
      }
    }

    if (errorMessages.length === 0) {
      return res.json({
        success: 'Products updated and billed',
        invoiceNumber: currentInvoiceNumber,
      });
    } else {
      return res.status(400).json({
        errors: errorMessages,
        invoiceNumber: currentInvoiceNumber,
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

        if (!question) {
            return res.status(400).json({ error: 'Question parameter is required.' });
        }

        const products = await prisma.products.findMany({
            where: {
                productName: {
                    contains: question,
                },
            },
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

