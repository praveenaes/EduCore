import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

//This defines the structure of a column.
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortField?: string;
}

//Defines the props accepted by the table.
//for userdata
export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  minTableWidth?: string;
}

export const Table = <T,>({ 
  columns, 
  data, 
  keyExtractor, 
  isLoading = false,
  sortBy,
  sortOrder,
  onSort,
  minTableWidth,
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar rounded-xl border border-neutral-200/50 bg-white shadow-xs">
      <table className={`min-w-full divide-y divide-neutral-200/60 text-left text-sm text-neutral-600 ${minTableWidth ?? ''}`}>
        <thead className="bg-neutral-50 font-semibold text-neutral-700 uppercase tracking-wider text-xs">
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className={`px-6 py-4 ${column.className ?? ''}`}>
                {column.sortField && onSort ? (
                  <button
                    onClick={() => onSort(column.sortField!)}
                    className="flex items-center gap-1 hover:text-neutral-900 transition-colors duration-150 focus:outline-hidden cursor-pointer"
                  >
                    {column.header}
                    {sortBy === column.sortField ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-brand-600" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-brand-600" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-neutral-300 hover:text-neutral-400" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/50 bg-white">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              {/* Without colSpan, your loading cell would occupy only one column. */}
              <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-400">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-neutral-50/60 transition-colors duration-150"
              >
                {columns.map((column, colIdx) => {
                  const content =
                    typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode);

                  return (
                    <td
                      key={colIdx}
                      className={`whitespace-nowrap px-6 py-4 font-medium text-neutral-800 ${
                        column.className ?? ''
                      }`}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
