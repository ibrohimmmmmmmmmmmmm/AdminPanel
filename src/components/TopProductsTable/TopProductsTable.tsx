const topProducts = [
  { name: "Men Grey Hoodie", price: "$49.90", units: 204 },
  { name: "Women Striped T-Shirt", price: "$34.90", units: 155 },
  { name: "Wome White T-Shirt", price: "$40.90", units: 120 },
];

export function TopProductsTable() {
  return (
    <div className="w-full">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-row {
          animation: fadeUp 0.4s ease forwards;
          opacity: 0;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        .product-row:hover {
          transform: translateX(2px);
        }
        .product-thumb {
          transition: transform 0.25s ease;
        }
        .product-row:hover .product-thumb {
          transform: scale(1.08) rotate(-2deg);
        }
      `}</style>

      <h3 className="mb-4 text-base md:text-lg font-bold text-slate-900 dark:text-white">
        Top Products by Units Sold
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Name</th>
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Price</th>
              <th className="text-left font-medium text-slate-500 dark:text-slate-400 pb-3">Units</th>
            </tr>
          </thead>

          <tbody>
            {topProducts.map((p, i) => (
              <tr
                key={i}
                className="product-row border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 last:border-none"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="product-thumb w-9 h-9 bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {p.name}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 text-slate-500 dark:text-slate-400">{p.price}</td>
                <td className="py-3.5 font-semibold text-slate-900 dark:text-white">{p.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}