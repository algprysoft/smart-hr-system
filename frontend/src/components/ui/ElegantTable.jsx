export const ElegantTable = ({ children }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-slate-800 transition-all duration-300">
      <table className="w-full text-right border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children }) => (
  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-700">
    <tr>{children}</tr>
  </thead>
);

export const TableHeader = ({ children }) => (
  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
    {children}
  </th>
);

export const TableRow = ({ children }) => (
  <tr 
    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200 last:border-0"
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className="" }) => (
  <td className={`p-4 text-sm text-slate-700 dark:text-slate-200 align-middle whitespace-nowrap ${className}`}>
    {children}
  </td>
);
