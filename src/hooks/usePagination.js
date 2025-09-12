import { useState } from "react";

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 0,
  PAGE_SIZE_OPTIONS: [10, 15, 25, 50, 100],
};

export const usePagination = (initialSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) => {
  const [page, setPage] = useState(PAGINATION_CONFIG.DEFAULT_PAGE);
  const [size, setSize] = useState(initialSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const resetPagination = () => {
    setPage(PAGINATION_CONFIG.DEFAULT_PAGE);
    setTotalPages(0);
    setTotalRecords(0);
  };

  return {
    page,
    setPage,
    size,
    setSize,
    totalPages,
    setTotalPages,
    totalRecords,
    setTotalRecords,
    resetPagination,
  };
};