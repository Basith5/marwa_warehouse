import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ZodError, object } from 'zod';
import { editProductData, editProductSchema, productData, productSchema } from './model';

const prisma = new PrismaClient();

export const productRouter = express.Router();

//Routes
productRouter.post("/addProducts", addProducts);
productRouter.get("/getProducts", getProducts);
productRouter.post('/editProducts/:id', editProduct);
productRouter.delete("/deleteProducts/:id", deleteProducts);


//#region
//add products api route
async function addProducts(req: Request, res: Response) {
    try {
      const data = productSchema.safeParse(req.body);
  
      if (!data.success) {
        let errMessage: string = fromZodError(data.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
  
      const resultData: productData = data.data;
  
      if (!resultData) {
        return res.status(409).json({
          error: {
            message: "Invalid params",
          },
        });
      }

      // Check if a product with the same productName already exists
      const existingProduct = await prisma.products.findFirst({
        where: {
          productName: resultData.productName,
        },
      });
    
      if (existingProduct) {
        return res.status(409).json({
          error: {
            message: "Product already exists.",
          },
        });
      }
  
      const products = await prisma.products.create({
        data: {
          productName: resultData.productName,
          quantity: resultData.quantity,
          mrp: resultData.mrp,
          discount: resultData.discount,
          netRate: resultData.netRate,
          add: resultData.add,
          saleRate: resultData.saleRate,
          category: resultData.category,
        },
      });
  
      if (!products) {
        return res.json({
          error: "Product is not saved",
        });
      }
  
      return res.json({
        success: "Products Added Successfully",
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return res.status(500).json({
        error: {
          message: "Internal server error",
        },
      });
    }
}
  
//#endregion

//#region
//get products
async function getProducts(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 8;
    console.log(maxResult);
    const productName = req.query.productName as string;
    let page = parseInt(req.query.page as string) || 1;

    const whereCondition = productName
      ? {
          productName: {
            contains: productName,
          },
        }
      : {};

    const totalProductsCount = await prisma.products.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalProductsCount / maxResult);

    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      return res.status(404).json({
        error: {
          message: "Page not found.",
        },
      });
    }

    const skipCount = (page - 1) * maxResult;

    const products = await prisma.products.findMany({
      take: maxResult,
      skip: skipCount,
      where: whereCondition,
    });

    if (products.length === 0) {
      return res.status(404).json({
        error: {
          message: "No products available on this page.",
        },
      });
    }

    return res.json({
      success: products,
      totalProductsCount: totalProductsCount,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({
      error: {
        message: "Internal server error",
      },
    });
  }
}
//#endregion

//#region
//Edit products api
async function editProduct(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.id);
  
      if (!productId) {
        return res.status(400).json({
          error: "Product Id is required",
        });
      }
  
      const data = editProductSchema.safeParse(req.body);
  
      if (!data.success) {
        let errMessage: string = fromZodError(data.error).message;
        return res.status(400).json({
          error: {
            message: errMessage,
          },
        });
      }
  
      const updatedData: editProductData = data.data;
  
      const existingProduct = await prisma.products.findUnique({
        where: {
          id: productId,
        },
      });
  
      if (!existingProduct) {
        return res.status(404).json({
          error: "Product not found.",
        });
      }
  
      const updateFields: Record<string, any> = {};
  
      if (updatedData.productName !== undefined) {
        updateFields.productName = updatedData.productName;
      }
  
      if (updatedData.quantity !== undefined) {
        updateFields.quantity = updatedData.quantity;
      }
  
      if (updatedData.mrp !== undefined) {
        updateFields.mrp = updatedData.mrp;
      }

      if (updatedData.discount !== undefined) {
        updateFields.discount = updatedData.discount;
      }

      if (updatedData.netRate !== undefined) {
        updateFields.netRate = updatedData.netRate;
      }

      if (updatedData.add !== undefined) {
        updateFields.add = updatedData.add;
      }

      if (updatedData.saleRate !== undefined) {
        updateFields.saleRate = updatedData.saleRate;
      }

      if (updatedData.category !== undefined) {
        updateFields.category = updatedData.category;
      }
  
      const updatedProduct = await prisma.products.update({
        where: {
          id: productId,
        },
        data: updateFields,
      });
  
      return res.json({
        success: "Product updated successfully.",
        updatedProduct,
      });

    } catch (error) {
      console.error("An error occurred:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
}
//#endregion

//#region
// Delete product api
async function deleteProducts(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.id);
  
      if (!productId) {
        return res.status(400).json({
          error: "Product Id is required",
        });
      }
  
      const existingProduct = await prisma.products.findUnique({
        where: { id: productId },
      });
  
      if (!existingProduct) {
        return res.status(404).json({
          error: "Product not found.",
        });
      }
  
      await prisma.products.delete({ where: { id: productId } });
  
      return res.json({
        success: "Product deleted successfully.",
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  }
//#endregion

