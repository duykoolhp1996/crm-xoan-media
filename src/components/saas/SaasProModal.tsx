import React from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface SaasProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaasProModal: React.FC<SaasProModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const features = [
    'Unlimited Real-time Analytics & AI Forecast',
    'Custom Domain & White-label Reporting',
    'Automated Cohort Retention & Churn Prediction',
    'Full Webhook & REST API Integrations',
    'Dedicated Account Manager & 99.99% SLA'
  ];

  return (
    <div className="fixed inset-0 z-[100] p-4 flex items-center justify-center animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden my-auto z-10 text-neutral-900 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-black/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="saas-lime-badge text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              ✦ Pro Plan
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">
              Unlock Advanced Business Intelligence
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Scalable analytics infrastructure engineered for high-growth SaaS teams.
            </p>
          </div>

          <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-neutral-400 font-medium">Billed Annually</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-[#B8F23D]">$79</span>
                <span className="text-xs text-neutral-400">/ workspace / mo</span>
              </div>
            </div>
            <span className="bg-[#B8F23D]/20 text-[#B8F23D] text-[10px] font-bold px-2 py-1 rounded-lg border border-[#B8F23D]/30">
              Save 25%
            </span>
          </div>

          <div className="space-y-2.5">
            {features.map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-xs text-neutral-700">
                <div className="w-4 h-4 rounded-full bg-[#B8F23D]/40 text-neutral-950 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#B8F23D] hover:bg-[#a6e624] text-neutral-950 font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>Upgrade to Pro Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
