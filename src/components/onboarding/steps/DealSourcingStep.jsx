/**
 * Deal Sourcing Step
 * Capture deal criteria: industries, size, structure, geography, risk tolerance
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function DealSourcingStep({ formData, setFormData, errors }) {
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
        <h2 className="text-2xl font-bold text-white mb-2">Deal Sourcing Criteria</h2>
        <p className="text-gray-400">Help us find the right opportunities for you</p>
      </div>

      {/* Target Industries */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Target industries</label>
          <Tooltip text="Select industries you're interested in. You can always adjust this later." />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            'Technology', 'Healthcare', 'FinTech', 'Real Estate', 'Energy',
            'Consumer', 'SaaS', 'AI/ML', 'Logistics', 'Manufacturing',
            'Education', 'Sustainability', 'Food & Beverage', 'Travel & Hospitality'
          ].map(industry => (
            <button
              key={industry}
              onClick={() => toggleArray('target_industries', industry)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.target_industries?.includes(industry)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
        {errors.target_industries && <ErrorMessage msg={errors.target_industries} />}
      </div>

      {/* Investment Size */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Investment size range</label>
          <Tooltip text="Per-deal investment amount in USD" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">Minimum</label>
            <input
              type="number"
              value={formData.investment_size_min ?? ''}
              onChange={(e) => setFormData({ ...formData, investment_size_min: parseInt(e.target.value) || null })}
              placeholder="e.g., 50000"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-2">Maximum</label>
            <input
              type="number"
              value={formData.investment_size_max ?? ''}
              onChange={(e) => setFormData({ ...formData, investment_size_max: parseInt(e.target.value) || null })}
              placeholder="e.g., 5000000"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
        {(errors.investment_size_min || errors.investment_size_max || errors.investment_range) && (
          <ErrorMessage msg={errors.investment_size_min || errors.investment_size_max || errors.investment_range} />
        )}
      </div>

      {/* Deal Structures */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Preferred deal structures</label>
          <Tooltip text="Types of investment agreements you're comfortable with" />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            'Equity', 'Convertible Note', 'SAFE', 'Debt', 'Preferred Stock',
            'Revenue Share', 'Warrants', 'Joint Venture'
          ].map(structure => (
            <button
              key={structure}
              onClick={() => toggleArray('preferred_deal_structures', structure)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.preferred_deal_structures?.includes(structure)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
              }`}
            >
              {structure}
            </button>
          ))}
        </div>
        {errors.preferred_deal_structures && <ErrorMessage msg={errors.preferred_deal_structures} />}
      </div>

      {/* Geographic Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Geographic preferences</label>
          <Tooltip text="Regions where you want to source deals" />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            'North America', 'Europe', 'Asia-Pacific', 'Latin America',
            'Middle East & Africa', 'Anywhere Global'
          ].map(region => (
            <button
              key={region}
              onClick={() => toggleArray('geographic_preferences', region)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.geographic_preferences?.includes(region)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        {errors.geographic_preferences && <ErrorMessage msg={errors.geographic_preferences} />}
      </div>

      {/* Risk Tolerance */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Risk tolerance</label>
          <Tooltip text="How comfortable are you with high-risk, high-reward opportunities?" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'conservative', label: 'Conservative', desc: 'Proven business models, lower volatility' },
            { value: 'moderate', label: 'Moderate', desc: 'Balanced risk-reward mix' },
            { value: 'aggressive', label: 'Aggressive', desc: 'High-risk ventures, moonshots' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, risk_tolerance: option.value })}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                formData.risk_tolerance === option.value
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