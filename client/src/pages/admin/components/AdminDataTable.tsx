interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  useFlexLayout?: boolean;
}

function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "Tidak ada data",
  useFlexLayout = false,
}: AdminDataTableProps<T>) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300 ${
        useFlexLayout ? "flex flex-col flex-1" : ""
      }`}
    >
      <div
        className={`overflow-x-auto overflow-y-auto ${
          useFlexLayout ? "flex-1" : "max-h-[calc(100vh-28rem)]"
        }`}
      >
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 transition-colors duration-300">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 ${
                    column.headerClassName || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    onRowClick
                      ? "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  } transition-colors`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm text-gray-900 dark:text-gray-100 ${
                        column.className || ""
                      }`}
                    >
                      {typeof column.accessor === "function"
                        ? column.accessor(row, rowIndex)
                        : String(row[column.accessor] || "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDataTable;
