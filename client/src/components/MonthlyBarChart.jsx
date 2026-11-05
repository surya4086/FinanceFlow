
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function MonthlyBarChart({ transactions = [] }) {
  const monthlyTotals = {};

  transactions.forEach((t) => {
    if (!t.date) return;

    const date = new Date(`${String(t.date).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!monthlyTotals[key]) {
      monthlyTotals[key] = {
        month: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        income: 0,
        expense: 0,
      };
    }

    const amount = Number(t.amount || 0);

    if (t.type?.toUpperCase() === "INCOME") {
      monthlyTotals[key].income += amount;
    } else if (t.type?.toUpperCase() === "EXPENSE") {
      monthlyTotals[key].expense += amount;
    }
  });

  const data = Object.keys(monthlyTotals)
    .sort()
    .map((key) => monthlyTotals[key]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">
        Monthly Financial Trends
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Compare income and expenses month by month
      </p>

      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400">
          No monthly transaction data available.
        </p>
      ) : (
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis
                tickFormatter={(value) =>
                  `₹${value.toLocaleString("en-IN")}`
                }
              />

              <Tooltip
                formatter={(value) =>
                  formatCurrency(Number(value))
                }
              />

              <Legend />

              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="expense"
                name="Expenses"
                fill="#f87171"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
