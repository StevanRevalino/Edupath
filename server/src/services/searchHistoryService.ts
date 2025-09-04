import { SearchHistoryRepository } from "../repositories/searchHistoryRepository";
import { SearchType } from "@prisma/client";

const searchHistoryRepository = new SearchHistoryRepository();

export class SearchHistoryService {
  // Save search query with duplicate checking
  async saveSearch(
    query: string,
    type: SearchType,
    userId?: string,
    ipAddress?: string
  ) {
    try {
      if (!query || !type) {
        throw new Error("Query and type are required");
      }

      if (!Object.values(SearchType).includes(type)) {
        throw new Error("Invalid search type");
      }

      // Check if the same search exists for this user recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const recentSearches = await searchHistoryRepository.findMany({
        user_id: userId || undefined,
        query: query.trim(),
        limit: 1,
      });

      // Filter for searches within last hour
      const recentSearch = recentSearches.find(
        (search) => new Date(search.created_at) >= oneHourAgo
      );

      if (recentSearch) {
        // For now, just return success since we don't have update method
        return {
          success: true,
          message: "Search already recorded recently",
          data: recentSearch,
        };
      }

      // Create new search history record
      const newSearch = await searchHistoryRepository.create({
        query: query.trim(),
        type,
        user_id: userId,
      });

      return {
        success: true,
        message: "Search history saved",
        data: newSearch,
      };
    } catch (error) {
      console.error("Error saving search:", error);
      throw error;
    }
  }

  // Get search history for user
  async getUserSearchHistory(userId: string, type?: SearchType, limit = 50) {
    try {
      const filters: any = { user_id: userId, limit };
      if (type) filters.type = type;

      const history = await searchHistoryRepository.findMany(filters);

      return {
        success: true,
        data: history,
        total: history.length,
      };
    } catch (error) {
      console.error("Error getting user search history:", error);
      throw error;
    }
  }

  // Get popular searches
  async getPopularSearches(type?: SearchType, limit = 10) {
    try {
      const popularSearches = await searchHistoryRepository.getPopularSearches(
        type,
        limit
      );

      return {
        success: true,
        data: popularSearches,
        total: popularSearches.length,
      };
    } catch (error) {
      console.error("Error getting popular searches:", error);
      throw error;
    }
  }

  // Get recent searches (for autocomplete suggestions)
  async getRecentSearches(type?: SearchType, limit = 10) {
    try {
      const filters: any = { limit };
      if (type) filters.type = type;

      const recentSearches = await searchHistoryRepository.findMany(filters);

      // Get unique queries only
      const uniqueQueries = Array.from(
        new Set(recentSearches.map((search) => search.query))
      ).slice(0, limit);

      return {
        success: true,
        data: uniqueQueries,
        total: uniqueQueries.length,
      };
    } catch (error) {
      console.error("Error getting recent searches:", error);
      throw error;
    }
  }

  // Delete user's search history
  async deleteUserSearchHistory(userId: string, type?: SearchType) {
    try {
      if (type) {
        // Get specific searches by type first
        const searchesToDelete =
          await searchHistoryRepository.findByUserIdAndType(userId, type);

        // Delete them individually
        for (const search of searchesToDelete) {
          await searchHistoryRepository.delete(search.id);
        }

        return {
          success: true,
          message: `Deleted ${searchesToDelete.length} search history records`,
          deleted_count: searchesToDelete.length,
        };
      } else {
        // Delete all searches for user
        const result = await searchHistoryRepository.deleteByUserId(userId);

        return {
          success: true,
          message: "All user search history deleted",
          deleted_count: result.count,
        };
      }
    } catch (error) {
      console.error("Error deleting user search history:", error);
      throw error;
    }
  }

  // Get search statistics
  async getSearchStatistics(type?: SearchType) {
    try {
      // Use repository's built-in stats method
      const stats = await searchHistoryRepository.getStats();

      return {
        success: true,
        data: {
          total_searches: stats.total,
          today_searches: stats.today,
          prodi_searches: stats.prodi,
          universitas_searches: stats.universitas,
          unique_users: stats.uniqueUsers,
          search_type: type || "ALL",
        },
      };
    } catch (error) {
      console.error("Error getting search statistics:", error);
      throw error;
    }
  }
}
