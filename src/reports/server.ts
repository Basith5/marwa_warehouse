import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { fromZodError } from "zod-validation-error"
import { ZodError, object } from 'zod';

const prisma = new PrismaClient();

export const reportRouter = express.Router();

//route
reportRouter.get('/', getReports)
reportRouter.get('/by', getReportsBy)


//#region
//getBill Request
// async function getReports(req: Request, res: Response) {
//     try {
//       const maxResult = parseInt(req.query.maxResult as string) || 10;
//       const page = parseInt(req.query.page as string) || 1;
//       const date = req.query.date as string;
  
//       if (!date) {
//         return res.status(400).json({
//           error: "date param is missing",
//         });
//       }
  
//       // Define where condition to filter by date
//       const whereCondition = date
//         ? {
//             date: {
//               equals: date,
//             },
//           }
//         : {};
  
//       // Fetch reports data with pagination and filtering by date
//       const reports = await prisma.reports.findMany({
//         where: whereCondition,
//         take: maxResult,
//         skip: (page - 1) * maxResult,
//       });
  
//       const totalReportsCount = await prisma.reports.count({
//         where: whereCondition,
//       });
  
//       if (reports.length === 0) {
//         return res.status(404).json({
//           error: {
//             message: "No reports available for the given date.",
//           },
//         });
//       }
  
//       const totalPages = Math.ceil(totalReportsCount / maxResult);
  
//       // Check if the requested page number is out of range
//       if (page > totalPages) {
//         return res.status(404).json({
//           error: {
//             message: "Page not found.",
//           },
//         });
//       }
  
//       return res.json({
//         success: reports,
//         totalReportsCount,
//         totalPages,
//       });
//     } catch (error) {
//       console.error("An error occurred:", error);
//       return res.status(500).json({ error: "Internal server error." });
//     }
// }
async function getReports(req: Request, res: Response) {
  try {
      const maxResult = parseInt(req.query.maxResult as string) || 10;
      const page = parseInt(req.query.page as string) || 1;
      const date = req.query.date as string;
      const searchName = req.query.name as string; // Add query parameter for name search

      if (!date && !searchName) {
          return res.status(400).json({
              error: "date param or name param is missing",
          });
      }

      // Define where condition to filter by date and name (if provided)
      const whereCondition = {
          ...(date && {
              date: {
                  equals: date,
              },
          }),
          ...(searchName && {
              name: {
                  equals: searchName,
              },
          }),
      };

      // Fetch reports data with pagination and filtering by date and/or name
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
//     try {
//       const maxResult = parseInt(req.query.maxResult as string) || 10; // Number of results per page
//       const pageNumber = parseInt(req.query.pageNumber as string) || 1; // Page number
//       const startDate = req.query.startDate as string;
//       const endDate = req.query.endDate as string;
  
//       if (!startDate || !endDate) {
//         return res.json({
//           error: "startDate and endDate parameters are required.",
//         });
//       }
  
//       // Define where condition to filter by date range
//       const whereCondition = {
//         date: {
//           gte: startDate, // Greater than or equal to start date
//           lte: endDate,   // Less than or equal to end date
//         },
//       };
  
//       // Fetch reports data with pagination and filtering by date range
//       const reports = await prisma.reports.findMany({
//         where: whereCondition,
//         take: maxResult,
//         skip: (pageNumber - 1) * maxResult,
//       });
  
//       const totalReportsCount = await prisma.reports.count({
//         where: whereCondition,
//       });
  
//       if (reports.length === 0) {
//         return res.status(404).json({
//           error: {
//             message: "No reports available for the given date range.",
//           },
//         });
//       }
  
//       const totalPages = Math.ceil(totalReportsCount / maxResult);
  
//       return res.json({
//         success: reports,
//         totalReportsCount,
//         totalPages,
//       });
//     } catch (error) {
//       console.error('An error occurred:', error);
//       return res.status(500).json({ error: 'Internal server error.' });
//     }
// }
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
              lte: endDate,   // Less than or equal to end date
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
          take: maxResult,
          skip: (page - 1) * maxResult,
      });

      const totalReportsCount = await prisma.reports.count({
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
      });
  } catch (error) {
      console.error('An error occurred:', error);
      return res.status(500).json({ error: 'Internal server error.' });
  }
}
//#endregion

