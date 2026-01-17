/**
 * Investor Profile Step
 * Capture investor type, experience, and portfolio size
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function InvestorProfileStep({ formData, setFormData, errors }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Yourself</h2>
        <p className="text-gray-400">This helps us recommend relevant opportunities and communities</p>
      </div>

      {/* Investor Type */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">What's your investor type?</label>
          <Tooltip text="Select the category that best describes your investment capacity and approach" />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { value: 'angel', label: 'Angel Investor', desc: 'Early-stage, high-risk ventures' },
            { value: 'venture_capital', label: 'Venture Capital', desc: 'Institutional fund with portfolio' },
            { value: 'institutional', label: 'Institutional Investor', desc: 'Large-scale institutional capital' },
            { value: 'family_office', label: 'Family Office', desc: 'Managing family wealth' },
            { value: 'accredited_individual', label: 'Accredited Individual', desc: 'High-net-worth individual' },
            { value: 'limited_partner', label: 'Limited Partner', desc: 'Investing in funds' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, investor_type: option.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.investor_type === option.value
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-white text-sm">{option.label}</div>
              <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
        {errors.investor_type && <ErrorMessage msg={errors.investor_type} />}
      </div>

      {/* Years of Experience */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Years of investing experience?</label>
          <Tooltip text="Including all types of investments: stocks, real estate, startups, etc." />
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            max="70"
            value={formData.years_experience ?? ''}
            onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) || null })}
            placeholder="e.g., 5"
            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
          />
          <span className="flex items-center text-gray-400">years</span>
        </div>
        {errors.years_experience && <ErrorMessage msg={errors.years_experience} />}
      </div>

      {/* Portfolio Size */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Approximate portfolio under management</label>
          <Tooltip text="Your investable assets or assets under management" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'under_1m', label: 'Under $1M' },
            { value: '1m_10m', label: '$1M - $10M' },
            { value: '10m_50m', label: '$10M - $50M' },
            { value: '50m_100m', label: '$50M - $100M' },
            { value: 'over_100m', label: 'Over $100M' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, managed_portfolio_value: option.value })}
              className={`p-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                formData.managed_portfolio_value === option.value
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.managed_portfolio_value && <ErrorMessage msg={errors.managed_portfolio_value} />}
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