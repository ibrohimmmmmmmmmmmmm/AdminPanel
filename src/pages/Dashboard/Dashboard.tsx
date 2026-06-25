import { ArrowRight, Package, TrendingUp, DollarSign } from "lucide-react";
import { SalesChart } from "../../components/SalesChart/SalesChart";
import { RecentTransactions } from "../../components/RecentTransactions/RecentTransactions";
import { TopProductsTable } from "../../components/TopProductsTable/TopProductsTable";

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <div
    className="fade-up border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl flex items-center gap-4 p-5"
    style={{ animationDelay: delay }}
  >
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={22} className={color.replace("bg-", "text-")} />
    </div>

    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </h3>
    </div>
  </div>
);

export default function DashBoard() {
  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>

      {/* Header */}
      <h1 className="fade-up text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
        Dashboard
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="Sales" value="$152k" icon={TrendingUp} color="bg-orange-500" delay="0.05s" />
        <StatCard title="Cost" value="$99.7k" icon={DollarSign} color="bg-orange-500" delay="0.1s" />
        <StatCard title="Profit" value="$32.1k" icon={Package} color="bg-emerald-500" delay="0.15s" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Chart */}
        <div
          className="fade-up lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm"
          style={{ animationDelay: "0.2s" }}
        >
          <SalesChart />
        </div>

        {/* Top Products */}
        <div
          className="fade-up shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6"
          style={{ animationDelay: "0.25s" }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Top selling products
            </h3>

            <button className="text-sm flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition">
              See All <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Healthcare Erbology
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      in Accessories
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-emerald-600">
                  13,153
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div
          className="fade-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6"
          style={{ animationDelay: "0.3s" }}
        >
          <RecentTransactions />
        </div>

        <div
          className="fade-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6"
          style={{ animationDelay: "0.35s" }}
        >
          <TopProductsTable />
        </div>
      </div>

    </div>
  );
}