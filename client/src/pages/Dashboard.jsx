import { useEffect, useMemo, useState } from "react";

import SpendingPieChart from "../components/SpendingPieChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import TransactionFilters from "../components/TransactionFilters";

import toast from "react-hot-toast";



import {
  Wallet,
  Bell,
  CircleUserRound,
  TrendingUp,
  TrendingDown,
  Target,
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Settings,
  ShoppingCart,
  Utensils,
  Car,
  Receipt,
  Plus,
  LogOut,
  Trash2,
  X,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  getTransactions,
  addTransaction,
  deleteTransaction,
} from "../services/transactionService";


// We will connect it to a backend API later.
const MONTHLY_BUDGET = 20000;

const categoryColors = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#f87171",
  "#8b5cf6",
  "#06b6d4",
];

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getTransactionIcon = (category, type) => {
  if (type === "INCOME") return Wallet;

  const value = (category || "").toLowerCase();

  if (value.includes("food") || value.includes("grocery"))
    return ShoppingCart;

  if (value.includes("restaurant") || value.includes("dining"))
    return Utensils;

  if (value.includes("travel") || value.includes("transport"))
    return Car;

  return Receipt;
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function SummaryCard({ title, amount, note, icon: Icon, color }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[color]}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <h2 className="mt-4 text-2xl font-bold text-slate-900">
        {amount}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        {note}
      </p>
    </div>
  );
}


function TransactionModal({ onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    title: "",
    category: "Food",
    amount: "",
    type: "EXPENSE",
    date: new Date().toLocaleDateString("en-CA"),
    description: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!Number.isFinite(Number(form.amount))) {
      setError("Amount must be a valid number.");
      return;
    }

    if (Number(form.amount) > 100000000) {
      setError("Amount is too large.");
      return;
    }

    if (!form.date) {
      setError("Please select a date.");
      return;
    }

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        amount: Number(form.amount),
        category:
          form.type === "INCOME" ? "Income" : form.category,
      });
    } catch (err) {
      setError(err.message || "Unable to save transaction.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="my-auto w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 sm:p-6 shadow-2xl">

        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add Transaction
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record your income or expenses.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Transaction Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Transaction Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Monthly Salary"
              required
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
            />
          </div>

          {form.type === "EXPENSE" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Health</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Amount (INR)
            </label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes"
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={18} />
                Save Transaction
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [filters, setFilters] = useState({
  type: "ALL",
  category: "ALL",
  fromDate: "",
  toDate: "",
});

const resetFilters = () => {
  setFilters({
    type: "ALL",
    category: "ALL",
    fromDate: "",
    toDate: "",
  });
};

  // Fetch transactions from Spring Boot
  const loadTransactions = async () => {
    try {
      setError("");

      const data = await getTransactions();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected transaction response from server.");
      }

      setTransactions(data);
        } catch (err) {
        const message =
            err.message || "Unable to load transactions.";

        setError(message);
        toast.error(message);
        }
        finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Calculate income and expenses dynamically
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type?.toUpperCase() === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type?.toUpperCase() === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const balance = totalIncome - totalExpense;

  // Calculate expenses for the current month only
const currentMonthExpense = useMemo(() => {
  const now = new Date();

  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  return transactions
    .filter((t) => {
      return (
        t.type?.toUpperCase() === "EXPENSE" &&
        String(t.date || "").slice(0, 7) === currentMonth
      );
    })
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
}, [transactions]);

  // Calculate category-wise expenses
  const categories = useMemo(() => {
    const totals = {};

    transactions
      .filter((t) => t.type?.toUpperCase() === "EXPENSE")
      .forEach((t) => {
        const category = t.category || "Other";

        totals[category] =
          (totals[category] || 0) + Number(t.amount || 0);
      });

    return Object.entries(totals)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [transactions]);


const categoryOptions = [
  ...new Set(
    transactions
      .map((t) => t.category)
      .filter(Boolean)
  ),
];

const filteredRecentTransactions = useMemo(() => {
  return recentTransactions.filter((t) => {
    const transactionDate = String(t.date || "").slice(0, 10);
    const type = t.type?.toUpperCase();

    const matchesType =
      filters.type === "ALL" || type === filters.type;

    const matchesCategory =
      filters.category === "ALL" ||
      t.category === filters.category;

    const matchesFromDate =
      !filters.fromDate ||
      transactionDate >= filters.fromDate;

    const matchesToDate =
      !filters.toDate ||
      transactionDate <= filters.toDate;

    return (
      matchesType &&
      matchesCategory &&
      matchesFromDate &&
      matchesToDate
    );
  });
}, [recentTransactions, filters]);


  const totalCategoryExpense = categories.reduce(
    (sum, category) => sum + category.amount,
    0
  );

  // Add transaction

  // Add transaction
  const handleAddTransaction = async (transaction) => {
    setSaving(true);

    try {
      await addTransaction(transaction);

      setShowModal(false);

      toast.success("Transaction added successfully!");

      await loadTransactions();
    } catch (err) {
      toast.error(err.message || "Unable to add transaction.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    if (!id) {
      toast.error("Transaction ID is missing.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this transaction?"
      )
    ) {
      return;
    }

    try {
      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter(
          (transaction) =>
            String(transaction.id || transaction._id) !== String(id)
        )
      );

      toast.success("Transaction deleted successfully!");
    } catch (err) {
      toast.error(
        err.message || "Unable to delete transaction."
      );
    }
  };


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

const displayedTransactions = showAll
  ? filteredRecentTransactions
  : filteredRecentTransactions.slice(0, 5);

  const budgetPercentage =
  MONTHLY_BUDGET > 0
    ? Math.min(
        (currentMonthExpense / MONTHLY_BUDGET) * 100,
        100
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white p-6 lg:block">
        <h1 className="text-2xl font-bold text-emerald-600">
          FinanceFlow
        </h1>

        <p className="mt-2 text-xs text-slate-400">
          PERSONAL FINANCE MANAGER
        </p>

        <nav className="mt-10 space-y-3">
          <a
            href="#overview"
            className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-700"
          >
            <LayoutDashboard size={20} />
            Overview
          </a>

          <a
            href="#transactions"
            className="flex items-center gap-3 rounded-xl p-3 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeftRight size={20} />
            Transactions
          </a>

          <a
            href="#categories"
            className="flex items-center gap-3 rounded-xl p-3 text-slate-600 hover:bg-slate-100"
          >
            <ChartNoAxesCombined size={20} />
            Analytics
          </a>

          <a
            href="#budget"
            className="flex items-center gap-3 rounded-xl p-3 text-slate-600 hover:bg-slate-100"
          >
            <Target size={20} />
            Budget
          </a>

          <a
            href="#settings"
            className="flex items-center gap-3 rounded-xl p-3 text-slate-600 hover:bg-slate-100"
          >
            <Settings size={20} />
            Settings
          </a>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-8 left-6 flex items-center gap-3 rounded-xl p-3 text-rose-600 hover:bg-rose-50"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div>
            <p className="text-sm text-slate-500">
              Welcome back,
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              {user?.name || "User"} 👋
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 p-3 text-slate-600"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-2">
              <CircleUserRound size={24} />
              <span className="hidden text-sm font-medium sm:block">
                {user?.name || "Account"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-rose-50 p-3 text-rose-600 lg:hidden"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8">
          {/* Overview */}
          <section id="overview">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Dashboard Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Here's your financial summary.
                </p>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Plus size={18} />
                Add Transaction
              </button>
            </div>

            {error && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <span>{error}</span>

                <button
                  onClick={loadTransactions}
                  className="font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-3 text-slate-500">
                <LoaderCircle className="animate-spin" />
                Loading your transactions...
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    title="Total Balance"
                    amount={formatCurrency(balance)}
                    note="Income minus expenses"
                    icon={Wallet}
                    color="emerald"
                  />

                  <SummaryCard
                    title="Total Income"
                    amount={formatCurrency(totalIncome)}
                    note="Total recorded income"
                    icon={TrendingUp}
                    color="blue"
                  />

                  <SummaryCard
                    title="Total Expenses"
                    amount={formatCurrency(totalExpense)}
                    note="Total recorded expenses"
                    icon={TrendingDown}
                    color="rose"
                  />

                  <SummaryCard
                    title="Monthly Budget"
                    amount={formatCurrency(MONTHLY_BUDGET)}
                    note="Current illustrative monthly limit"
                    icon={Target}
                    color="violet"
                  />
                </div>

                {/* Transactions and Categories */}
                <div className="mt-8 grid gap-6 xl:grid-cols-3">
                  {/* Recent Transactions */}
                  <section
                    id="transactions"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">
                        Recent Transactions
                      </h3>

                      <button
                        onClick={() => setShowAll((previous) => !previous)}
                        className="text-sm font-semibold text-emerald-600"
                      >
                        {showAll ? "Show Less" : "View All"}
                      </button>
                    </div>

                    <TransactionFilters
                    filters={filters}
                    onChange={setFilters}
                    categories={categoryOptions}
                    onReset={resetFilters}
                    />

                    {filteredRecentTransactions.length === 0 ? (
                      <div className="py-10 text-center">
                        <Receipt
                          size={38}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-medium text-slate-600">
                          No transactions yet.
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Add your first income or expense.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {displayedTransactions.map((transaction) => {
                          const isIncome =
                            transaction.type?.toUpperCase() === "INCOME";

                          const Icon = getTransactionIcon(
                            transaction.category,
                            transaction.type?.toUpperCase()
                          );

                          const id = transaction.id || transaction._id;

                          return (
                            <div
                              key={id}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className={`rounded-xl p-3 ${
                                    isIncome
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <Icon size={20} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-800">
                                    {transaction.title}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {transaction.category} ·{" "}
                                    {formatDate(transaction.date)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-3">
                                <p
                                  className={`whitespace-nowrap text-sm font-bold ${
                                    isIncome
                                      ? "text-emerald-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {isIncome ? "+" : "-"}
                                  {formatCurrency(transaction.amount)}
                                </p>

                                <button
                                  onClick={() =>
                                    handleDeleteTransaction(id)
                                  }
                                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  aria-label={`Delete ${transaction.title}`}
                                  title="Delete transaction"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* Category Breakdown */}
                  <section
                    id="categories"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-slate-900">
                      Spending by Category
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Category-wise expenses
                    </p>

                    <div className="mt-7 space-y-6">
                      {categories.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                          No expense data available.
                        </p>
                      ) : (
                        categories.map((category) => (
                          <div key={category.name}>
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="font-medium text-slate-700">
                                {category.name}
                              </span>

                              <span className="font-semibold text-slate-900">
                                {formatCurrency(category.amount)}
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${
                                    totalCategoryExpense > 0
                                      ? (category.amount /
                                          totalCategoryExpense) *
                                        100
                                      : 0
                                  }%`,
                                  backgroundColor: category.color,
                                }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                      {/* Analytics Charts */}
                    <div className="mt-6 grid gap-6 xl:grid-cols-2">

                    <SpendingPieChart
                        transactions={transactions}
                    />

                    <MonthlyBarChart
                        transactions={transactions}
                    />

                    </div>



                {/* Monthly Budget */}
                <section
                  id="budget"
                  className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    Monthly Budget Progress
                  </h3>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="text-slate-500">
                      Expenses: {formatCurrency(currentMonthExpense)}
                    </span>

                    <span className="font-semibold text-slate-900">
                      Budget: {formatCurrency(MONTHLY_BUDGET)}
                    </span>
                  </div>

                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        totalExpense > MONTHLY_BUDGET
                          ? "bg-rose-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${budgetPercentage}%` }}
                    />
                  </div>

                  <p
                    className={`mt-3 text-sm ${
                      totalExpense > MONTHLY_BUDGET
                        ? "text-rose-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {totalExpense > MONTHLY_BUDGET
                      ? `${formatCurrency(
                          currentMonthExpense - MONTHLY_BUDGET
                        )} over budget`
                      : `${formatCurrency(
                          MONTHLY_BUDGET - currentMonthExpense
                        )} remaining this month`}
                  </p>
                </section>
              </>
            )}

            <footer className="mt-8 text-center text-xs text-slate-400">
              FinanceFlow · Personal Finance Tracker
            </footer>
          </section>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddTransaction}
          saving={saving}
        />
      )}
    </div>
  );
  }
