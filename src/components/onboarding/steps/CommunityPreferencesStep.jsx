/**
 * Community Preferences Step
 * Capture community engagement settings, notification preferences, and privacy
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function CommunityPreferencesStep({ formData, setFormData, errors }) {
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
        <h2 className="text-2xl font-bold text-white mb-2">Community & Networking</h2>
        <p className="text-gray-400">Customize how you want to engage with our community (optional)</p>
      </div>

      {/* Peer Group Interests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Types of peer groups you're interested in</label>
          <Tooltip text="Connect with investors who share similar interests" />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {[
            'Angel Investors', 'Venture Syndicates', 'Real Estate Investors',
            'Institutional Investors', 'Industry-Specific Groups', 'Women Investors',
            'Geographic Communities', 'Sector Cohorts'
          ].map(group => (
            <button
              key={group}
              onClick={() => toggleArray('peer_group_interests', group)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                formData.peer_group_interests?.includes(group)
                  ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                  : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Priority */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">What's your primary engagement focus?</label>
          <Tooltip text="How do you want to spend your time in the community?" />
        </div>
        <div className="space-y-2">
          {[
            { value: 'networking', label: 'Networking', desc: 'Build relationships with other investors', icon: '🤝' },
            { value: 'knowledge_sharing', label: 'Knowledge Sharing', desc: 'Learn from discussions and insights', icon: '📚' },
            { value: 'deal_flow', label: 'Deal Flow', desc: 'Source and share deal opportunities', icon: '💼' },
            { value: 'balanced', label: 'Balanced', desc: 'Mix of all activities', icon: '⚖️' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, engagement_priority: option.value })}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${
                formData.engagement_priority === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-400'
              }`}
            >
              <span className="text-xl mt-1">{option.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm">{option.label}</div>
                <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Frequency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">How often should we notify you?</label>
          <Tooltip text="Community updates, deal alerts, and group discussions" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'weekly', label: 'Weekly', desc: 'Summary each week' },
            { value: 'biweekly', label: 'Bi-weekly', desc: 'Every 2 weeks' },
            { value: 'monthly', label: 'Monthly', desc: 'Monthly digest' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, notification_frequency: option.value })}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                formData.notification_frequency === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-white text-sm">{option.label}</div>
              <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Profile visibility</label>
          <Tooltip text="Who can see your profile and investment information?" />
        </div>
        <div className="space-y-2">
          {[
            { value: 'private', label: 'Private', desc: 'Only visible to people you connect with', icon: '🔒' },
            { value: 'friends_only', label: 'Friends Only', desc: 'Visible to your network (default)', icon: '👥' },
            { value: 'public', label: 'Public', desc: 'Visible to all community members', icon: '🌍' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFormData({ ...formData, privacy_level: option.value })}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                formData.privacy_level === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{option.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{option.label}</div>
                  <div className="text-xs text-gray-400">{option.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deal Sharing */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-white font-semibold">Share your deal flow with the community?</label>
          <Tooltip text="Help others discover opportunities you find interesting" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFormData({ ...formData, willing_to_share_deals: true })}
            className={`flex-1 p-4 rounded-lg border-2 transition-all text-center font-semibold ${
              formData.willing_to_share_deals === true
                ? 'border-green-500 bg-green-500/10 text-green-300'
                : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
            }`}
          >
            Yes, share my deals
          </button>
          <button
            onClick={() => setFormData({ ...formData, willing_to_share_deals: false })}
            className={`flex-1 p-4 rounded-lg border-2 transition-all text-center font-semibold ${
              formData.willing_to_share_deals === false
                ? 'border-gray-500 bg-gray-500/10 text-gray-300'
                : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-400'
            }`}
          >
            Keep private
          </button>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-100 text-sm">
          <span className="font-semibold">💡 Tip:</span> You can update all community settings anytime in your preferences.
        </p>
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