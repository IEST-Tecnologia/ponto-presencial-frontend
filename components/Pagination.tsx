import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ page, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4">
      <Link
        href={`${baseUrl}?page=${page - 1}`}
        className={`px-3 py-1 text-sm rounded ${
          page === 0
            ? "bg-gray-300 text-gray-500 pointer-events-none"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
        aria-disabled={page === 0}
      >
        Anterior
      </Link>
      <span className="text-sm text-gray-600">
        {page + 1} / {totalPages}
      </span>
      <Link
        href={`${baseUrl}?page=${page + 1}`}
        className={`px-3 py-1 text-sm rounded ${
          page === totalPages - 1
            ? "bg-gray-300 text-gray-500 pointer-events-none"
            : "bg-primary text-white hover:bg-primary/90"
        }`}
        aria-disabled={page === totalPages - 1}
      >
        Próximo
      </Link>
    </div>
  );
}
