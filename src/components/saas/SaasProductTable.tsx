import React, { useState } from 'react';
import { SAAS_PRODUCTS, ProductPerformanceItem } from '../../data/saasData';
import { ArrowUpRight, MoreHorizontal, ArrowUpDown } from 'lucide-react';

export const SaasProductTable: React.FC = () => {
  const [products] = useState<ProductPerformanceItem[]>(SAAS_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="saas-card p-6">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Product Sales Performance
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time revenue, units sold and market momentum across top solutions
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 text-xs font-semibold">
          {['all', 'SaaS', 'Machine Learning', 'Developer'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full transition-all capitalize whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-black/[0.05] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Product</th>
              <th className="pb-3 px-4">Category</th>
              <th className="pb-3 px-4 text-right">Revenue</th>
              <th className="pb-3 px-4 text-right">Units Sold</th>
              <th className="pb-3 px-4">Performance</th>
              <th className="pb-3 px-4 text-right">Growth</th>
              <th className="pb-3 pl-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {filteredProducts.map((prod) => (
              <tr
                key={prod.id}
                className="hover:bg-neutral-50 transition-colors group cursor-pointer"
              >
                {/* Product Name & Icon */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-lg shadow-sm border border-black/[0.04] shrink-0 group-hover:scale-105 transition-transform">
                      {prod.image}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-neutral-400">ID: {prod.id}</p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className="font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full text-[11px]">
                    {prod.category}
                  </span>
                </td>

                {/* Revenue */}
                <td className="py-3.5 px-4 text-right">
                  <p className="font-extrabold text-neutral-900">{prod.revenue}</p>
                  <p className="text-[10px] text-neutral-400">gross volume</p>
                </td>

                {/* Units Sold */}
                <td className="py-3.5 px-4 text-right">
                  <p className="font-semibold text-neutral-800">
                    {prod.unitsSold.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-neutral-400">licenses</p>
                </td>

                {/* Performance Progress Bar */}
                <td className="py-3.5 px-4 w-36">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-900 rounded-full group-hover:bg-[#83c906] transition-all duration-300"
                        style={{ width: `${prod.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-500 w-8 text-right">
                      {prod.progressPercent}%
                    </span>
                  </div>
                </td>

                {/* Growth */}
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    {prod.growth}
                  </span>
                </td>

                {/* Action button */}
                <td className="py-3.5 pl-4 text-right">
                  <button
                    className="w-7 h-7 rounded-xl hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors"
                    title="Options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
