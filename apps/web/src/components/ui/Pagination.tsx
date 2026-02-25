import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = React.memo(
  function Pagination({ currentPage: page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <nav className="mt-8 flex items-center justify-center gap-1 sm:gap-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-warm-600 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
          aria-label="Previous page"
        >
          <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden text-sm font-medium sm:inline">Previous</span>
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm text-warm-600 hover:bg-warm-100"
            >
              1
            </button>
            {start > 2 && <span className="px-0.5 text-warm-400 sm:px-1">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
              p === page
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-warm-600 hover:bg-warm-100'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-0.5 text-warm-400 sm:px-1">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm text-warm-600 hover:bg-warm-100"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-warm-600 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
          aria-label="Next page"
        >
          <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="hidden text-sm font-medium sm:inline">Next</span>
        </button>
      </nav>
    );
  },
);
