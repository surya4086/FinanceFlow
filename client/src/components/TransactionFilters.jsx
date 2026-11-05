
export default function TransactionFilters({
  filters,
  onChange,
  categories,
  onReset,
}) {
  const update = (event) => {
    onChange({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Transaction Type
        </label>
        <select
          name="type"
          value={filters.type}
          onChange={update}
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
        >
          <option value="ALL">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Category
        </label>
        <select
          name="category"
          value={filters.category}
          onChange={update}
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
        >
          <option value="ALL">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          From Date
        </label>
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={update}
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          To Date
        </label>
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={update}
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
        />
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
