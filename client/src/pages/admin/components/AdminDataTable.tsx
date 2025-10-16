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
}

function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "Tidak ada data",
}: AdminDataTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  column.headerClassName || ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-500"
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
                    ? "hover:bg-gray-50 cursor-pointer"
                    : "hover:bg-gray-50"
                } transition-colors`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 text-sm text-gray-900 ${
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
  );
}

export default AdminDataTable;
