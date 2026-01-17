/**
 * Review Summary Step
 * Final review and confirmation of all user preferences
 */

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReviewSummaryStep({ formData }) {
  const formatCurrency = (num) => {
    if (!num) return 'Not set';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const getLabel = (value, options) => {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Your Profile</h2>
        <p className="text-gray-400">Here's everything we've gathered. Make sure it looks right!</p>
      </div>

      {/* Investor Profile */}
      <SectionCard title="Investor Profile" icon="👤">
        <Row label="Investor Type" value={formData.investor_type} />
        <Row label="Experience" value={`${formData.years_experience} years`} />
        <Row label="Portfolio Size" value={formData.managed_portfolio_value} />
      </SectionCard>

      {/* Deal Sourcing Criteria */}
      <SectionCard title="Deal Sourcing Criteria" icon="🎯">
        <Row label="Industries" value={formData.target_industries?.join(', ')} />
        <Row label="Investment Range" value={`${formatCurrency(formData.investment_size_min)} - ${formatCurrency(formData.investment_size_max)}`} />
        <Row label="Deal Structures" value={formData.preferred_deal_structures?.join(', ')} />
        <Row label="Geographic Focus" value={formData.geographic_preferences?.join(', ')} />
        <Row label="Risk Tolerance" value={getLabel(formData.risk_tolerance, [
          { value: 'conservative', label: 'Conservative' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'aggressive', label: 'Aggressive' }
        ])} />
      </SectionCard>

      {/* Portfolio Goals */}
      <SectionCard title="Portfolio Goals" icon="📊">
        <Row label="Time Horizon" value={getLabel(formData.time_horizon, [
          { value: 'short_term', label: '1-3 Years' },
          { value: 'medium_term', label: '3-7 Years' },
          { value: 'long_term', label: '7+ Years' }
        ])} />
        <Row label="Target Annual Return" value={`${formData.target_return_annual_percent}%`} />
        <Row label="Diversification" value={getLabel(formData.diversification_preference, [
          { value: 'high', label: 'High Diversification' },
          { value: 'moderate', label: 'Moderate Diversification' },
          { value: 'low', label: 'Low Diversification' }
        ])} />
        <Row label="Asset Classes" value={formData.asset_class_focus?.join(', ')} />
      </SectionCard>

      {/* Community Settings */}
      <SectionCard title="Community Preferences" icon="👥">
        <Row label="Peer Groups" value={formData.peer_group_interests?.length > 0 ? formData.peer_group_interests.join(', ') : 'Not specified'} />
        <Row label="Engagement Focus" value={getLabel(formData.engagement_priority, [
          { value: 'networking', label: 'Networking' },
          { value: 'knowledge_sharing', label: 'Knowledge Sharing' },
          { value: 'deal_flow', label: 'Deal Flow' },
          { value: 'balanced', label: 'Balanced' }
        ])} />
        <Row label="Notifications" value={getLabel(formData.notification_frequency, [
          { value: 'weekly', label: 'Weekly' },
          { value: 'biweekly', label: 'Bi-weekly' },
          { value: 'monthly', label: 'Monthly' }
        ])} />
        <Row label="Profile Visibility" value={getLabel(formData.privacy_level, [
          { value: 'private', label: 'Private' },
          { value: 'friends_only', label: 'Friends Only' },
          { value: 'public', label: 'Public' }
        ])} />
        <Row label="Share Deal Flow" value={formData.willing_to_share_deals ? 'Yes' : 'No'} />
      </SectionCard>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-100 font-semibold">You're all set!</p>
            <p className="text-green-200 text-sm mt-1">
              Click "Complete Setup" to start exploring personalized opportunities and connecting with the community.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-100 text-sm">
          You can update any of these preferences anytime in your account settings. This helps us keep your recommendations relevant.
        </p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-4 border-b border-white/10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-700/50 last:border-0 last:pb-0">
      <span className="text-gray-400 text-sm font-medium">{label}</span>
      <span className="text-white text-sm font-semibold text-right max-w-xs">{value || 'Not specified'}</span>
    </div>
  );
}