import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = React.memo(
  function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg px-3 py-2 text-sm text-warm-600 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          Previous
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="rounded-lg px-3 py-2 text-sm text-warm-600 hover:bg-warm-100"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-warm-400">...</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              p === page
                ? 'bg-brand-700 text-white'
                : 'text-warm-600 hover:bg-warm-100'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-warm-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="rounded-lg px-3 py-2 text-sm text-warm-600 hover:bg-warm-100"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg px-3 py-2 text-sm text-warm-600 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          Next
        </button>
      </nav>
    );
  },
);
