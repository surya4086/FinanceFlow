
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#f87171",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function SpendingPieChart({ transactions = [] }) {
  const totals = {};

  transactions
    .filter(
      (t) => t.type?.toUpperCase() === "EXPENSE"
    )
    .forEach((t) => {
      const category = t.category || "Other";

      totals[category] =
        (totals[category] || 0) + Number(t.amount || 0);
    });

  const data = Object.entries(totals).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">
        Spending by Category
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Category-wise expense distribution
      </p>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">
          No expense data available.
        </p>
      ) : (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={85}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
              />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
