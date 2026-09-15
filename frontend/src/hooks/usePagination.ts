import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setPaginationData: (total: number, totalPages: number) => void;
  resetPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * usePagination - Centralized pagination state hook.
 *
 * Usage:
 *   const pagination = usePagination({ initialPage: 1, initialLimit: 10 });
 *
 *   // After API response:
 *   pagination.setPaginationData(res.total, res.totalPages);
 *
 *   // Reset to page 1 on search change:
 *   pagination.resetPage();
 *
 *   // Pass to <Pagination /> component:
 *   <Pagination
 *     currentPage={pagination.page}
 *     totalPages={pagination.totalPages}
 *     onPageChange={pagination.setPage}
 *   />
 */
export function usePagination(options: UsePaginationOptions = {}): PaginationState {
  const { initialPage = 1, initialLimit = 10 } = options;

  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  /** Resets to page 1. Call this whenever the search/filter changes. */
  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  /**
   * Call this after a successful API fetch to update total count and totalPages.
   * @param total     - Total number of records from the API
   * @param totalPages - Total number of pages from the API
   */
  const setPaginationData = useCallback((total: number, totalPages: number) => {
    setTotal(total);
    setTotalPages(totalPages);
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setPaginationData,
    resetPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
