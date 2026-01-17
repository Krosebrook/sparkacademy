/**
 * Portfolio Goals Step
 * Capture time horizon, return targets, diversification, and asset classes
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function PortfolioGoalsStep({ formData, setFormData, errors }) {
  const toggleArray = (key, value) => {
    const current = formData[key] || [];
    setFormData({
      ...formData,
      [key]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Portfolio Goals</h2>
        <p className="text-gray-400">Define your investment objectives and return expectations</p>
      </div>

      {/* Time Horizon */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Investment time horizon</label>
          <Tooltip text="How long are you willing to hold investments before needing liquidity?" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'short_term', label: '1-3 Years', desc: 'Quick exits', icon: '⚡' },
            { value: 'medium_term', label: '3-7 Years', desc: 'Balanced growth', icon: '📈' },
            { value: 'long_term', label: '7+ Years', desc: 'Long-term wealth', icon: '🏛️' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, time_horizon: option.value })}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                formData.time_horizon === option.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-400'
              }`}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="font-semibold text-white text-sm">{option.label}</div>
              <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
        {errors.time_horizon && <ErrorMessage msg={errors.time_horizon} />}
      </div>

      {/* Target Return */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Target annual return</label>
          <Tooltip text="Expected annual percentage return (%). Be realistic based on your risk profile." />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="200"
            step="5"
            value={formData.target_return_annual_percent ?? ''}
            onChange={(e) => setFormData({ ...formData, target_return_annual_percent: parseInt(e.target.value) || null })}
            placeholder="e.g., 20"
            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          <span className="text-white font-semibold">%</span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          💡 Typical ranges: Conservative 8-12%, Moderate 15-25%, Aggressive 25-50%
        </p>
        {errors.target_return_annual_percent && <ErrorMessage msg={errors.target_return_annual_percent} />}
      </div>

      {/* Diversification Preference */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Diversification preference</label>
          <Tooltip text="How spread out should your portfolio be?" />
        </div>
        <div className="space-y-2">
          {[
            { value: 'high', label: 'High Diversification', desc: 'Many small positions (10+), lower concentration risk' },
            { value: 'moderate', label: 'Moderate Diversification', desc: 'Balanced portfolio (5-10 positions)' },
            { value: 'low', label: 'Low Diversification', desc: 'Concentrated (2-4 large positions)' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, diversification_preference: option.value })}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                formData.diversification_preference === option.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-white text-sm">{option.label}</div>
              <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Asset Classes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Asset class focus</label>
          <Tooltip text="What stages and types of investments interest you?" />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            'Early Stage (Seed/Series A)', 'Growth Stage (Series B+)', 'Late Stage (Pre-IPO)',
            'Real Estate', 'Infrastructure', 'Private Equity', 'Credit/Debt',
            'Crypto & Digital Assets'
          ].map(assetClass => (
            <button
              key={assetClass}
              onClick={() => toggleArray('asset_class_focus', assetClass)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.asset_class_focus?.includes(assetClass)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
              }`}
            >
              {assetClass}
            </button>
          ))}
        </div>
        {errors.asset_class_focus && <ErrorMessage msg={errors.asset_class_focus} />}
      </div>
    </div>
  );
}

function Tooltip({ text }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-500 hover:text-gray-400"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute top-full mt-2 left-0 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 whitespace-nowrap z-10">
          {text}
        </div>
      )}
    </div>
  );
}

function ErrorMessage({ msg }) {
  return <div className="mt-2 text-sm text-red-400">{msg}</div>;
}