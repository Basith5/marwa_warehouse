import express, { Request, Response, response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { fromZodError } from "zod-validation-error";
import { ZodError, object } from "zod";

const prisma = new PrismaClient();

export const reportRouter = express.Router();

//route
reportRouter.get("/", getReport);
reportRouter.get("/by", getReportsBy);


//complete
async function getReport(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const searchName = req.query.name as string;

    const currentDate = new Date().toISOString().split("T")[0];
    const formattedDate = currentDate.split("-").reverse().join("-");

    console.log(formattedDate);

    const whereCondition = {
      date: {
        equals: formattedDate,
      },
      ...(searchName && {
        name: {
          equals: searchName,
        },
      }),
    };

    const reports = await prisma.reports.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        paymentMethod: true,
        gst: true,
        spl: true,
        name: true,
      },
      where: whereCondition,
      take: maxResult,
      skip: (page - 1) * maxResult,
    });

    const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

        // Count reports by invoice number
        const countByInvoiceNumber = await prisma.reports.groupBy({
          by: ["invoiceNumber"],
          _count: {
            _all: true,
          },
          where: whereCondition,
        });
    
    if (reports.length === 0) {
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

  // Assuming countByInvoiceNumber is an array of objects with "_count" and "invoiceNumber" properties
  const countByInvoiceNumberFormatted = countByInvoiceNumber.map((item) => ({
    invoiceNumber: item.invoiceNumber,
    totalProduct: item._count._all,
  }));

  return res.json({
    success: reports,
    totalReportsCount,
    totalPages,
    countByInvoiceNumber: countByInvoiceNumberFormatted,
  });

  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}


//#region
//getBill Request

// async function getReports(req: Request, res: Response) {
//   try {
//     const maxResult = parseInt(req.query.maxResult as string) || 10;
//     const page = parseInt(req.query.page as string) || 1;

//     const searchName = req.query.name as string;

//     const currentDate = new Date().toISOString().split("T")[0];
//     const formattedDate = currentDate.split("-").reverse().join("-");

//     console.log(formattedDate);

//     const whereCondition = {
//       date: {
//         equals: formattedDate,
//       },
//       ...(searchName && {
//         name: {
//           equals: searchName,
//         },
//       }),
//     };

//     const reports = await prisma.reports.findMany({
//       where: whereCondition,
//       take: maxResult,
//       skip: (page - 1) * maxResult,
//     });

//     const totalReportsCount = await prisma.reports.count({
//       where: whereCondition,
//     });

//     if (reports.length === 0) {
//       return res.status(404).json({
//         error: {
//           message: "No reports available for the given criteria.",
//         },
//       });
//     }

//     const totalPages = Math.ceil(totalReportsCount / maxResult);

//     // Check if the requested page number is out of range
//     if (page > totalPages) {
//       return res.status(404).json({
//         error: {
//           message: "Page not found.",
//         },
//       });
//     }

//     return res.json({
//       success: reports,
//       totalReportsCount,
//       totalPages,
//     });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// }
async function getReports(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const searchName = req.query.name as string;

    const currentDate = new Date().toISOString().split("T")[0];
    const formattedDate = currentDate.split("-").reverse().join("-");

    console.log(formattedDate);

    const whereCondition = {
      date: {
        equals: formattedDate,
      },
      ...(searchName && {
        name: {
          equals: searchName,
        },
      }),
    };

    const reports = await prisma.reports.findMany({
      where: whereCondition,
      take: maxResult,
      skip: (page - 1) * maxResult,
    });

    const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

    // Count reports by invoice number
    const countByInvoiceNumber = await prisma.reports.groupBy({
      by: ["invoiceNumber"],
      _count: {
        _all: true,
      },
      where: whereCondition,
    });

    if (reports.length === 0) {
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

    return res.json({
      success: reports,
      totalReportsCount,
      totalPages,
      countByInvoiceNumber,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

//#endregion

//#region
//get reports
// async function getReportsBy(req: Request, res: Response) {
//   try {
//     const maxResult = parseInt(req.query.maxResult as string) || 10; // Number of results per page
//     const page = parseInt(req.query.page as string) || 1; // Page number
//     const startDate = req.query.startDate as string;
//     const endDate = req.query.endDate as string;
//     const searchName = req.query.name as string; // Add query parameter for name search

//     if (!startDate || !endDate) {
//       return res.json({
//         error: "startDate and endDate parameters are required.",
//       });
//     }

//     // Define where condition to filter by date range and name (if provided)
//     const whereCondition = {
//       date: {
//         gte: startDate, // Greater than or equal to start date
//         lte: endDate, // Less than or equal to end date
//       },
//       ...(searchName && {
//         name: {
//           equals: searchName,
//         },
//       }),
//     };

//     // Fetch reports data with pagination and filtering by date range and/or name
//     const reports = await prisma.reports.findMany({
//       where: whereCondition,
//       take: maxResult,
//       skip: (page - 1) * maxResult,
//     });

//     const totalReportsCount = await prisma.reports.count({
//       where: whereCondition,
//     });

//     if (reports.length === 0) {
//       return res.status(404).json({
//         error: {
//           message: "No reports available for the given criteria.",
//         },
//       });
//     }

//     const totalPages = Math.ceil(totalReportsCount / maxResult);

//     // Check if the requested page number is out of range
//     if (page > totalPages) {
//       return res.status(404).json({
//         error: {
//           message: "Page not found.",
//         },
//       });
//     }

//     return res.json({
//       success: reports,
//       totalReportsCount,
//       totalPages,
//     });
//   } catch (error) {
//     console.error("An error occurred:", error);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// }

//complete
async function getReportsBy(req: Request, res: Response) {
  try {
    const maxResult = parseInt(req.query.maxResult as string) || 10; // Number of results per page
    const page = parseInt(req.query.page as string) || 1; // Page number
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const searchName = req.query.name as string; // Add query parameter for name search

    if (!startDate || !endDate) {
      return res.json({
        error: "startDate and endDate parameters are required.",
      });
    }

    // Define where condition to filter by date range and name (if provided)
    const whereCondition = {
      date: {
        gte: startDate, // Greater than or equal to start date
        lte: endDate, // Less than or equal to end date
      },
      ...(searchName && {
        name: {
          equals: searchName,
        },
      }),
    };

    // Fetch reports data with pagination and filtering by date range and/or name
    const reports = await prisma.reports.findMany({
      where: whereCondition,
      select: {
        id: true,
        invoiceNumber: true,
        paymentMethod: true,
        gst: true,
        spl: true,
        name: true,
      },
      take: maxResult,
      skip: (page - 1) * maxResult,
    });

    // Count reports by invoice number
    const countByInvoiceNumber = await prisma.reports.groupBy({
      by: ["invoiceNumber"],
      _count: {
        _all: true,
      },
      where: whereCondition,
    });

    if (reports.length === 0) {
      return res.status(404).json({
        error: {
          message: "No reports available for the given criteria.",
        },
      });
    }

     // Calculate total pages based on the total number of reports
     const totalReportsCount = await prisma.reports.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalReportsCount / maxResult);

    // Check if the requested page number is out of range
    if (page > totalPages) {
      return res.status(404).json({
        error: {
          message: "Page not found.",
        },
      });
    }

    // Transform the countByInvoiceNumber data into the desired format
    const countByInvoiceNumberFormatted = countByInvoiceNumber.map((item) => ({
      invoiceNumber: item.invoiceNumber,
      totalProduct: item._count._all,
    }));

    const totalInvoiceCount = countByInvoiceNumberFormatted.reduce(
      (acc, item) => acc + item.totalProduct,
      0
    );

    return res.json({
      success: reports,
      totalReportsCount,
      totalPages,
      totalInvoiceCount,
      countByInvoiceNumber: countByInvoiceNumberFormatted,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
//#endregion
