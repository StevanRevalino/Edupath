import { Request, Response } from "express";
import { PrismaClient, SearchType } from "@prisma/client";

const prisma = new PrismaClient();

export class SearchHistoryController {
  // POST /api/search-history - Save search query
  async saveSearch(req: Request, res: Response) {
    try {
      const { query, type } = req.body;
      const userId = req.user?.user_id; // From auth middleware if authenticated

      if (!query || !type) {
        return res.status(400).json({
          success: false,
          message: "Query and type are required",
        });
      }

      if (!Object.values(SearchType).includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid search type",
        });
      }

      // Check if the same search exists for this user recently (within last hour)
      const whereClause: any = {
        query: query.trim(),
        type,
        created_at: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      };

      if (userId) {
        whereClause.user_id = userId;
      } else {
        whereClause.user_id = null;
      }

      const recentSearch = await prisma.searchHistory.findFirst({
        where: whereClause,
      });

      if (recentSearch) {
        // Update the timestamp instead of creating new record
        const updated = await prisma.searchHistory.update({
          where: { id: recentSearch.id },
          data: { created_at: new Date() },
        });

        return res.json({
          success: true,
          message: "Search updated",
          data: updated,
        });
      }

      // Create new search history record
      const createData: any = {
        query: query.trim(),
        type,
      };

      if (userId) {
        createData.user_id = userId;
      }

      const searchHistory = await prisma.searchHistory.create({
        data: createData,
      });

      res.status(201).json({
        success: true,
        message: "Search saved",
        data: searchHistory,
      });
    } catch (error) {
      console.error("Error saving search history:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET /api/search-history/recent - Get recent searches
  async getRecentSearches(req: Request, res: Response) {
    try {
      const { type, limit = "5" } = req.query;
      const userId = req.user?.user_id; // From auth middleware if authenticated

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "Search type is required",
        });
      }

      if (!Object.values(SearchType).includes(type as SearchType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid search type",
        });
      }

      const getSearchWhereClause: any = {
        type: type as SearchType,
      };

      if (userId) {
        getSearchWhereClause.user_id = userId;
      } else {
        getSearchWhereClause.user_id = null;
      }

      const searchHistory = await prisma.searchHistory.findMany({
        where: getSearchWhereClause,
        orderBy: {
          created_at: "desc",
        },
        take: parseInt(limit as string),
        distinct: ["query"], // Get unique queries only
      });

      res.json({
        success: true,
        data: searchHistory,
      });
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // DELETE /api/search-history - Clear search history
  async clearHistory(req: Request, res: Response) {
    try {
      const { type } = req.query;
      const userId = req.user?.user_id; // From auth middleware if authenticated

      const deleteCondition: any = {};

      if (userId) {
        deleteCondition.user_id = userId;
      } else {
        deleteCondition.user_id = null;
      }

      if (type && Object.values(SearchType).includes(type as SearchType)) {
        deleteCondition.type = type as SearchType;
      }

      await prisma.searchHistory.deleteMany({
        where: deleteCondition,
      });

      res.json({
        success: true,
        message: "Search history cleared",
      });
    } catch (error) {
      console.error("Error clearing search history:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
