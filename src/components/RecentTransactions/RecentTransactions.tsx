const transactions = [
  { name: "Jagarnath S.", date: "24.05.2023", amount: "$124.97", status: "Paid" },
  { name: "Anand G.", date: "23.05.2023", amount: "$55.42", status: "Pending" },
  { name: "Kartik S.", date: "23.05.2023", amount: "$89.90", status: "Paid" },
];

export function RecentTransactions() {
  return (
    <div className="w-full h-auto md:h-71.25">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .row-fade {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
        }
        .tx-row {
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        .tx-row:hover {
          transform: translateX(2px);
        }
      `}</style>

      <h3 className="mb-4 text-base md:text-lg font-bold text-slate-900 dark:text-white">
        Recent Transactions
      </h3>

      {/* 📱 MOBILE VERSION */}
      <div className="md:hidden space-y-3">
        {transactions.map((t, i) => (
          <div
            key={i}
            className="row-fade rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm text-slate-900 dark:text-white">
                {t.name}
              </p>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  t.status === "Paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {t.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t.date}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {t.amount}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 💻 DESKTOP VERSION */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Name</th>
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Date</th>
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Amount</th>
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t, i) => (
              <tr
                key={i}
                className="row-fade tx-row border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 last:border-none"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <td className="py-3.5 font-medium text-slate-900 dark:text-white">{t.name}</td>
                <td className="py-3.5 text-slate-500 dark:text-slate-400">{t.date}</td>
                <td className="py-3.5 font-semibold text-slate-900 dark:text-white">{t.amount}</td>
                <td className="py-3.5">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      t.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}