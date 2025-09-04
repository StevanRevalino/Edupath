import { PrismaClient, SearchType } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateSearchHistoryDTO {
  user_id?: string;
  query: string;
  type: SearchType;
}

interface SearchHistoryFilters {
  user_id?: string;
  type?: SearchType;
  query?: string;
  limit?: number;
  offset?: number;
}

export class SearchHistoryRepository {
  // Create search history
  async create(data: CreateSearchHistoryDTO) {
    return prisma.searchHistory.create({
      data,
      include: {
        user: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Find by ID
  async findById(id: string) {
    return prisma.searchHistory.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
  }

  // Find many with filters
  async findMany(filters: SearchHistoryFilters = {}) {
    const where: any = {};

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.query) {
      where.query = {
        contains: filters.query,
        mode: "insensitive",
      };
    }

    return prisma.searchHistory.findMany({
      where,
      include: {
        user: {
          select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: filters.limit || undefined,
      skip: filters.offset || undefined,
    });
  }

  // Find by user ID
  async findByUserId(user_id: string, limit?: number) {
    return this.findMany({ user_id, limit });
  }

  // Find by type
  async findByType(type: SearchType, limit?: number) {
    return this.findMany({ type, limit });
  }

  // Find by user and type
  async findByUserIdAndType(user_id: string, type: SearchType, limit?: number) {
    return this.findMany({ user_id, type, limit });
  }

  // Get recent searches for user
  async getRecentSearches(user_id: string, limit: number = 10) {
    return prisma.searchHistory.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" },
      take: limit,
      distinct: ["query", "type"], // Get unique queries per type
    });
  }

  // Get popular searches
  async getPopularSearches(type?: SearchType, limit: number = 10) {
    const where = type ? { type } : {};

    return prisma.searchHistory.groupBy({
      by: ["query"],
      where,
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: "desc",
        },
      },
      take: limit,
    });
  }

  // Delete search history by ID
  async delete(id: string) {
    return prisma.searchHistory.delete({
      where: { id },
    });
  }

  // Delete search history by user ID
  async deleteByUserId(user_id: string) {
    return prisma.searchHistory.deleteMany({
      where: { user_id },
    });
  }

  // Delete old search history (older than specified days)
  async deleteOldHistory(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.searchHistory.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate,
        },
      },
    });
  }

  // Get count
  async count(filters: SearchHistoryFilters = {}) {
    const where: any = {};

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.query) {
      where.query = {
        contains: filters.query,
        mode: "insensitive",
      };
    }

    return prisma.searchHistory.count({ where });
  }

  // Get search statistics
  async getStats() {
    const [
      totalSearches,
      prodiSearches,
      universitasSearches,
      uniqueUsers,
      todaySearches,
    ] = await Promise.all([
      prisma.searchHistory.count(),
      prisma.searchHistory.count({ where: { type: SearchType.PRODI } }),
      prisma.searchHistory.count({ where: { type: SearchType.UNIVERSITAS } }),
      prisma.searchHistory
        .groupBy({
          by: ["user_id"],
          _count: { user_id: true },
        })
        .then((results) => results.length),
      prisma.searchHistory.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total: totalSearches,
      prodi: prodiSearches,
      universitas: universitasSearches,
      uniqueUsers,
      today: todaySearches,
    };
  }

  // Check if exists
  async exists(id: string): Promise<boolean> {
    const count = await prisma.searchHistory.count({
      where: { id },
    });
    return count > 0;
  }

  // Get search trends (searches per day for last N days)
  async getSearchTrends(days: number = 7, type?: SearchType) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      created_at: {
        gte: startDate,
      },
    };

    if (type) {
      where.type = type;
    }

    const results = await prisma.searchHistory.groupBy({
      by: ["created_at"],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // Group by date (ignore time)
    const trendsMap = new Map();
    results.forEach((result) => {
      const dateStr = result.created_at.toISOString().split("T")[0];
      if (trendsMap.has(dateStr)) {
        trendsMap.set(dateStr, trendsMap.get(dateStr) + result._count.id);
      } else {
        trendsMap.set(dateStr, result._count.id);
      }
    });

    return Array.from(trendsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
