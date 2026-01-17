/**
 * Welcome Step
 * Friendly introduction and onboarding overview
 */

import React from 'react';
import { Sparkles, TrendingUp, Users, Shield } from 'lucide-react';

export default function WelcomeStep({ formData, setFormData }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to Your Investment Platform</h2>
        <p className="text-gray-300 text-lg">
          Let's get to know your investment style and goals to personalize your experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FeatureCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Curated Deal Flow"
          description="Get deal opportunities that match your criteria and investment thesis"
        />
        <FeatureCard
          icon={<Users className="w-6 h-6" />}
          title="Connected Community"
          description="Network with like-minded investors and share insights"
        />
        <FeatureCard
          icon={<Shield className="w-6 h-6" />}
          title="Smart Insights"
          description="AI-powered recommendations based on your portfolio goals"
        />
        <FeatureCard
          icon={<Sparkles className="w-6 h-6" />}
          title="Personalized Experience"
          description="Everything tailored to your preferences and risk profile"
        />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-100 text-sm">
          <span className="font-semibold">💡 Tip:</span> The setup usually takes 5-10 minutes. You can always update your preferences later.
        </p>
      </div>

      <div className="space-y-3 text-sm text-gray-300">
        <p>Here's what we'll cover:</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            Your investor profile and experience level
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            Deal sourcing criteria (industries, size, structure)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            Portfolio goals and return expectations
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            Community engagement preferences
          </li>
        </ul>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
      <div className="text-purple-400 mb-2">{icon}</div>
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  );
}