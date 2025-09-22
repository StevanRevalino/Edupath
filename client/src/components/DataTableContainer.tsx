import { type ReactNode } from "react";

interface DataTableContainerProps {
  title: string;
  count?: number;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

const DataTableContainer = ({
  title,
  count,
  loading = false,
  children,
  className = "",
}: DataTableContainerProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-20rem)] sm:max-h-[calc(100vh-24rem)] flex flex-col ${className}`}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          {title} {count !== undefined && `(${count})`}
        </h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col overflow-hidden">{children}</div>
      )}
    </div>
  );
};

export default DataTableContainer;
