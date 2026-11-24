export class PaginationHelper {
  /**
   * Calculates the 'skip' and 'limit' values used by databases.
   */
  static getSkipAndLimit(page: number = 1, limit: number = 10) {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.max(1, Math.floor(limit));
    const skip = (safePage - 1) * safeLimit;
    
    return { skip, limit: safeLimit };
  }

  /**
   * Formats response matching the specific frontend key expectation.
   */
  static toPaginatedResult<T, Key extends string>(
    key: Key,
    data: T[],
    totalItems: number,
    page: number = 1,
    limit: number = 10
  ) {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      [key]: data,
      total: totalItems,
      page,
      limit,
      totalPages: totalPages || 1,
    } as Record<Key, T[]> & {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
}
