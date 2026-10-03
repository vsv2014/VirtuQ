import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const showPages = 5;

    const start = Math.max(1, currentPage - Math.floor(showPages / 2));
    // `endPage` is derived once, so it is a const.
    const endPage = Math.min(totalPages, start + showPages - 1);
    const first = Math.max(1, endPage - showPages + 1);

    for (let i = first; i <= endPage; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="rounded-lg border p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
          className={`rounded-lg px-4 py-2 ${
            currentPage === page
              ? 'bg-purple-600 text-white'
              : 'border hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="rounded-lg border p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <span className="ml-4 text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  );
}
