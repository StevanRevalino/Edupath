import { type ReactNode } from "react";

interface DataTableContainerProps {
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

const DataTableContainer = ({
  loading = false,
  children,
  className = "",
}: DataTableContainerProps) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden max-h-[calc(100vh-24rem)] sm:max-h-[calc(100vh-28rem)] flex flex-col transition-colors duration-300 ${className}`}
    >
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Memuat data...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      )}
    </div>
  );
};

export default DataTableContainer;
