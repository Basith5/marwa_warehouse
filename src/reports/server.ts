import express, { Request, Response, response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { fromZodError } from "zod-validation-error";
import { ZodError, object } from "zod";

const prisma = new PrismaClient();

export const reportRouter = express.Router();

//route
reportRouter.get("/", getReport);
reportRouter.get("/by", getReportsBy);
reportRouter.get("/products", getProductsReports);
reportRouter.get("/byName", getByName);
reportRouter.get("/pdf", getPdf);

//#region
//get Reports
async function getReport(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    // const searchName = req.query.name as string;

    const currentDate = new Date().toISOString().split("T")[0];
    const formattedDate = currentDate.split("-").reverse().join("-");

    // console.log(formattedDate);

    const whereCondition = {
      date: {
        equals: formattedDate,
      },
      // ...(searchName && {
      //   name: {
      //     contains: searchName,
      //   },
      // }),
    };

    const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

    // Count reports by invoice number and get the first product for each invoice
    const countByInvoiceNumber = await prisma.reports.groupBy({
      by: ["invoiceNumber"],
      _count: {
        _all: true,
      },
      where: whereCondition,
      _min: {
        id: true, // Use _min to get the minimum id for each invoice
      },
    });

    // Get the distinct invoice numbers
    const distinctInvoiceNumbers = countByInvoiceNumber.map((item) => item.invoiceNumber);

    // Retrieve the first product for each distinct invoice number
    const firstProductsByInvoice = await Promise.all(
      distinctInvoiceNumbers.map(async (invoiceNumber) => {
        const firstProduct = await prisma.reports.findFirst({
          where: {
            invoiceNumber: invoiceNumber,
          },
          select: {
            id: true,
            invoiceNumber: true,
            paymentMethod: true,
            gst: true,
            spl: true,
            name: true,
            date: true,
          },
        });
        return {
          invoiceNumber: invoiceNumber,
          _count: countByInvoiceNumber.find((item) => item.invoiceNumber === invoiceNumber)?._count._all || 0, // Handle possibly undefined value
          firstProduct: firstProduct,
        };
      })
    );

    // Paginate the results
    const startIndex = (page - 1) * maxResult;
    const endIndex = startIndex + maxResult;
    const paginatedFirstProducts = firstProductsByInvoice.slice(startIndex, endIndex);

    if (paginatedFirstProducts.length === 0) {
      return res.status(404).json({
        error: {
          message: "No reports available for the given criteria.",
        },
      });
    }

    const totalPages = Math.ceil(totalReportsCount / maxResult);

    // Check if the requested page number is out of range
    if (page > totalPages) {
      return res.status(404).json({
        error: {
          message: "Page not found.",
        },
      });
    }

        const countByInvoiceNumbers = await prisma.reports.groupBy({
          by: ["invoiceNumber"],
          _count: {
            _all: true,
          },
          where: whereCondition,
        });

    // Include the current page in the response
    return res.json({
      success: paginatedFirstProducts,
      totalReportsCount,
      totalPages,
      currentPage: page,
      countByInvoiceNumbers
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
//#endregion

//#region
//complete - 1
async function getReportsBy(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const searchName = req.query.name as string;

    if (!startDate || !endDate) {
      return res.json({
        error: "startDate and endDate parameters are required.",
      });
    }

    const formattedStartDate = startDate.split("-").join("-");
    const formattedEndDate = endDate.split("-").join("-");

    const whereCondition = {
      date: {
        gte: formattedStartDate,
        lte: formattedEndDate,
      },
      ...(searchName && {
        name: {
          equals: searchName,
        },
      }),
    };

    const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

     // Count reports by invoice number and get the first product for each invoice
     const countByInvoiceNumber = await prisma.reports.groupBy({
       by: ["invoiceNumber"],
       _count: {
         _all: true,
       },
       where: whereCondition,
       _min: {
         id: true, // Use _min to get the minimum id for each invoice
       },
     });

    // Get the distinct invoice numbers
    const distinctInvoiceNumbers = countByInvoiceNumber.map((item) => item.invoiceNumber);

    // Retrieve the first product for each distinct invoice number
    const firstProductsByInvoice = await Promise.all(
      distinctInvoiceNumbers.map(async (invoiceNumber) => {
        const firstProduct = await prisma.reports.findFirst({
          where: {
            invoiceNumber: invoiceNumber,
          },
          select: {
            id: true,
            invoiceNumber: true,
            paymentMethod: true,
            gst: true,
            spl: true,
            name: true,
            date: true,
          },
        });
        return {
          invoiceNumber: invoiceNumber,
          _count: countByInvoiceNumber.find((item) => item.invoiceNumber === invoiceNumber)?._count._all || 0, // Handle possibly undefined value
          firstProduct: firstProduct,
        };
      })
    );

    // Paginate the results
    const startIndex = (page - 1) * maxResult;
    const endIndex = startIndex + maxResult;
    const paginatedFirstProducts = firstProductsByInvoice.slice(startIndex, endIndex);

    if (paginatedFirstProducts.length === 0) {
      return res.status(404).json({
        error: {
          message: "No reports available for the given criteria.",
        },
      });
    }

    const totalPages = Math.ceil(totalReportsCount / maxResult);

    // Check if the requested page number is out of range
    if (page > totalPages) {
      return res.status(404).json({
        error: {
          message: "Page not found.",
        },
      });
    }

        const countByInvoiceNumbers = await prisma.reports.groupBy({
          by: ["invoiceNumber"],
          _count: {
            _all: true,
          },
          where: whereCondition,
        });

    // Include the current page in the response
    return res.json({
      success: paginatedFirstProducts,
      totalReportsCount,
      totalPages,
      currentPage: page,
      countByInvoiceNumbers
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
//#endregion

//#region
//getProductsReports 
async function getProductsReports(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const invoiceNumber = parseInt(req.query.invoiceNumber as string);

    if (isNaN(invoiceNumber)) {
      return res.status(400).json({
        error: "Invalid invoiceNumber. Please provide a valid invoiceNumber.",
      });
    }

    const whereCondition: any = {
      invoiceNumber: invoiceNumber, // Filter by invoice number
    };

    const reports = await prisma.reports.findMany({
      where: whereCondition,
      take: maxResult,
      skip: (page - 1) * maxResult,
    });

    const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

    if (reports.length === 0) {
      return res.status(404).json({
        error: {
          message: "No reports available for the given invoice number.",
        },
      });
    }

    const totalPages = Math.ceil(totalReportsCount / maxResult);

    // Check if the requested page number is out of range
    if (page > totalPages) {
      return res.status(404).json({
        error: {
          message: "Page not found.",
        },
      });
    }

    return res.json({
      success: reports,
      totalReportsCount,
      totalPages,
    });

  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
//#endregion

//#region
//getByName
async function getByName(req: Request, res: Response) {
  try {
    const name = req.query.name as string;
    const currentPage = parseInt(req.query.currentPage as string) || 1;
    const maxResult = parseInt(req.query.maxResult as string) || 10;

    if (!name) {
      return res.status(400).json({
        error: "name parameter is required.",
      });
    }

    const skip = (currentPage - 1) * maxResult;

    // Use 'contains' filter for a partial name match
    const totalProducts = await prisma.reports.count({
      where: {
        name: {
          contains: name,
        },
      },
    });

    const products = await prisma.reports.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        paymentMethod: true,
        gst: true,
        spl: true,
        name: true,
        date: true,
      },
      take: maxResult,
      skip: skip,
    });

    const countByInvoice = await prisma.reports.groupBy({
      by: ["invoiceNumber"],
      _count: {
        _all: true,
      },
      where: {
        name: {
          contains: name,
        },
      },
    });

    if (totalProducts === 0) {
      return res.status(404).json({
        message: "No products found for the provided name.",
      });
    }

    // Calculate totalPages
    const totalPages = Math.ceil(totalProducts / maxResult);

    return res.json({
      success: products,
      totalProducts: totalProducts,
      totalPages: totalPages, // Include totalPages in the response
      currentPage: currentPage,
      countByInvoice: countByInvoice,
    });

  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
//#endregion

//#region
//getReport for pdf
async function getPdf(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      return res.json({
        error: "startDate and endDate parameters are required.",
      });
    }

    const formattedStartDate = startDate.split("-").join("-");
    const formattedEndDate = endDate.split("-").join("-");

    const whereCondition = {
      date: {
        gte: formattedStartDate,
        lte: formattedEndDate,
      },
    };

    const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

    const countByInvoiceNumber = await prisma.reports.groupBy({
      by: ["invoiceNumber"],
      _count: {
        _all: true,
      },
      where: whereCondition,
      _min: {
        id: true,
      },
    });

    const distinctInvoiceNumbers = countByInvoiceNumber.map((item) => item.invoiceNumber);

    const firstProductsByInvoice = await Promise.all(
      distinctInvoiceNumbers.map(async (invoiceNumber) => {
        const firstProduct = await prisma.reports.findFirst({
          where: {
            invoiceNumber: invoiceNumber,
          },
          select: {
            id: true,
            invoiceNumber: true,
            paymentMethod: true,
            gst: true,
            spl: true,
            name: true,
            date: true,
          },
        });
        return {
          invoiceNumber: invoiceNumber,
          _count: countByInvoiceNumber.find((item) => item.invoiceNumber === invoiceNumber)?._count._all || 0,
          firstProduct: firstProduct,
        };
      })
    );

    const countByInvoiceNumbers = await prisma.reports.groupBy({
      by: ["invoiceNumber"],
      _count: {
        _all: true,
      },
      where: whereCondition,
    });

    if (firstProductsByInvoice.length === 0) {
      return res.status(404).json({
        error: {
          message: "No reports available for the given criteria.",
        },
      });
    }

    return res.json({
      success: firstProductsByInvoice,
      totalReportsCount,
      countByInvoiceNumbers
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
//#endregion
