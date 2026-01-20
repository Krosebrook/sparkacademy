import React from 'react';
import AIPortfolioBuilder from '@/components/portfolio/AIPortfolioBuilder';
import { Briefcase } from 'lucide-react';

export default function StudentPortfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Portfolio</h1>
              <p className="text-slate-600">Showcase your learning journey with AI-powered suggestions</p>
            </div>
          </div>
        </div>

        <AIPortfolioBuilder />
      </div>
    </div>
  );
}