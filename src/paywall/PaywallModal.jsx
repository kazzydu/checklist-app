import { useState } from 'react';
import { X, Check, Sparkles, Crown, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import { useSubscription } from './RevenueCatProvider';
import { PRODUCTS, PRO_FEATURES, LEMON_SQUEEZY_CHECKOUT } from './config';

export default function PaywallModal({ open, onClose, darkMode, lang }) {
  const { restorePurchases } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const lemonReady = LEMON_SQUEEZY_CHECKOUT.monthly || LEMON_SQUEEZY_CHECKOUT.yearly;

  const handlePurchase = () => {
    setError(null);
    const url = selectedPlan === 'yearly'
      ? LEMON_SQUEEZY_CHECKOUT.yearly
      : LEMON_SQUEEZY_CHECKOUT.monthly;

    if (!url) {
      setError('Products not configured yet. Add checkout URLs in your .env file.');
      return;
    }

    // Open LemonSqueezy checkout in new tab
    window.open(url, '_blank');
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    try {
      const success = await restorePurchases();
      if (success) {
        onClose();
        window.location.reload();
      } else {
        setError('No previous purchases found.');
      }
    } catch (e) {
      setError('Restore failed. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in-up ${
        darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      }`}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 z-10 transition-colors">
          <X size={20} className="text-slate-400" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Crown size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold mb-1">Upgrade to Pro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Unlock your full potential</p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {PRO_FEATURES.map(f => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-base">{f.icon}</span>
                <span className="text-xs font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Setup Warning */}
        {!lemonReady && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
            <strong>Setup required:</strong> Create products at{' '}
            <a href="https://app.lemonsqueezy.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
              app.lemonsqueezy.com <ExternalLink size={10} />
            </a>
            {' '}and add checkout URLs to your .env file.
          </div>
        )}

        {/* Plan Selection */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            {/* Monthly */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-500 mb-1">Monthly</div>
              <div className="text-xl font-extrabold">{PRODUCTS.monthly.price}</div>
              <div className="text-[10px] text-slate-400">/month</div>
            </button>

            {/* Yearly */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold">
                SAVE 33%
              </div>
              <div className="text-xs font-bold text-slate-500 mb-1">Yearly</div>
              <div className="text-xl font-extrabold">{PRODUCTS.yearly.price}</div>
              <div className="text-[10px] text-slate-400">/year</div>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Purchase Button */}
        <div className="px-6 pb-4">
          <button
            onClick={handlePurchase}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            Get Pro — {selectedPlan === 'yearly' ? PRODUCTS.yearly.price + '/yr' : PRODUCTS.monthly.price + '/mo'}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Restore */}
        <div className="px-6 pb-8 text-center">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw size={12} />
            {restoring ? 'Restoring...' : 'Restore Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
