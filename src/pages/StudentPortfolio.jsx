import React from 'react';
import AIPortfolioBuilder from '@/components/portfolio/AIPortfolioBuilder';
import { Briefcase, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function StudentPortfolio() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-lg font-bold">Career Portfolio</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <Search className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {user?.full_name?.[0] || 'U'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <AIPortfolioBuilder />
      </div>
    </div>
  );
}