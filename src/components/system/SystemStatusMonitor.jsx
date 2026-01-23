import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, TrendingUp, Activity, Zap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemStatusMonitor() {
  const [systemStatus, setSystemStatus] = useState({
    optimized: true,
    state: 'ACTIVE',
    engagement: 98,
    engagementChange: 12.4,
    rendering: 'Optimal',
    renderingReady: true
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        engagement: Math.min(100, Math.max(90, prev.engagement + (Math.random() - 0.5) * 2)),
        engagementChange: (Math.random() - 0.5) * 5
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-emerald-500/30 text-white overflow-hidden">
      {/* Status Bar */}
      <div className="bg-black/40 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">SYSTEM OPTIMIZED</div>
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wide">
              Steady State: {systemStatus.state}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-center mb-2">Living System Ready</CardTitle>
        <p className="text-center text-gray-400 text-sm">
          Automated workflows finalized. All nodes synchronized in steady-state focus.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/30"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Engagement
            </div>
            <div className="text-5xl font-bold mb-2">{systemStatus.engagement.toFixed(0)}%</div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              +{systemStatus.engagementChange.toFixed(1)}%
            </div>
          </motion.div>

          {/* Rendering */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/30"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Rendering
            </div>
            <div className="text-4xl font-bold mb-2">{systemStatus.rendering}</div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Ready
            </div>
          </motion.div>

          {/* Additional metrics could go here */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/30"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Response Time
            </div>
            <div className="text-4xl font-bold mb-2">47ms</div>
            <div className="flex items-center gap-1 text-blue-400 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Lightning
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-purple-500/30"
          >
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Active Users
            </div>
            <div className="text-4xl font-bold mb-2">2.4K</div>
            <div className="flex items-center gap-1 text-purple-400 text-sm font-semibold">
              <Activity className="w-4 h-4" />
              Live
            </div>
          </motion.div>
        </div>

        {/* FlashFusion Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center py-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 relative">
            <CheckCircle2 className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mb-2">
            <Zap className="w-5 h-5 text-amber-500" fill="currentColor" />
            <h3 className="text-2xl font-bold">FlashFusion</h3>
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
            Steady State Momentum
          </p>
        </motion.div>

        {/* Enter Platform Button */}
        <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 rounded-2xl text-lg shadow-xl">
          Enter Platform →
        </Button>
      </CardContent>
    </Card>
  );
}