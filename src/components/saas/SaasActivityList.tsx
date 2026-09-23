import React from 'react';
import { SAAS_RECENT_ACTIVITIES, ActivityEvent } from '../../data/saasData';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SaasActivityList: React.FC = () => {
  return (
    <div className="saas-card p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Recent Activity
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Live operational events & orders</p>
        </div>
        <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
          Live Sync
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3.5 my-auto">
        {SAAS_RECENT_ACTIVITIES.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-black/[0.02] transition-colors group cursor-pointer"
          >
            {/* Avatar / Icon */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${act.avatarBg}`}
            >
              {act.avatar}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-neutral-900 truncate group-hover:text-neutral-700">
                  {act.title}
                </p>
                <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                  {act.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                {act.subtitle}
              </p>
            </div>

            {/* Amount / Badge */}
            {act.amount && (
              <span className="text-xs font-extrabold text-neutral-900 shrink-0 self-center">
                {act.amount}
              </span>
            )}
            {act.badge && (
              <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 self-center">
                {act.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-black/[0.04]">
        <button className="w-full py-2 bg-neutral-100/80 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors">
          <span>View complete audit log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
