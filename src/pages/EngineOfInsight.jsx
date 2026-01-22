import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Activity, Zap } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function EngineOfInsight() {
  return (
    <div className="min-h-screen bg-[#0f0618] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-cyan-500/10">
        <div className="flex items-center justify-between p-4">
          <Link to={createPageUrl('Dashboard')} className="text-cyan-400 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 text-center">
            <h2 className="text-sm font-bold tracking-[0.1em] uppercase">SparkCourse: Engine</h2>
          </div>
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* Hero Neural Network Visualization */}
      <div className="p-4 pt-6">
        <div className="relative bg-gradient-to-br from-cyan-950/50 to-purple-950/30 rounded-xl overflow-hidden border border-cyan-500/20 min-h-[420px] flex flex-col justify-end"
          style={{
            backgroundImage: 'radial-gradient(rgba(6, 188, 249, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        >
          {/* Floating data lines */}
          <div className="absolute top-10 right-4 w-32 h-20 opacity-40">
            <div className="w-full h-px bg-cyan-500/40 mb-2" />
            <div className="w-2/3 h-px bg-purple-500/40 mb-2 ml-auto" />
            <div className="w-full h-px bg-cyan-500/40" />
          </div>

          {/* Neural nodes */}
          <div className="absolute inset-0">
            <div className="absolute top-12 left-12 w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,188,249,0.6)] animate-pulse" />
            <div className="absolute top-24 right-16 w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,188,249,0.5)] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-32 right-32 w-5 h-5 bg-purple-400 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>

          <div className="relative p-6 space-y-4 z-10">
            <Badge className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 text-xs">
              <div className="relative flex w-2 h-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-cyan-400" />
              </div>
              System Synchronized
            </Badge>
            
            <h1 className="text-4xl font-bold leading-tight">
              The Engine of Insight
            </h1>
            
            <p className="text-cyan-400/80 text-sm max-w-[280px]">
              Decrypting the neural pathways of personalized learning through real-time architectural analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-4 pt-6">
        <h4 className="text-cyan-400/60 text-xs font-bold tracking-[0.2em] uppercase border-l-2 border-cyan-500 pl-3">
          Neural Stream Analytics
        </h4>
      </div>

      {/* Body Text */}
      <div className="px-4 py-4">
        <p className="text-white/80 text-base leading-relaxed">
          Behold the underlying patterns that drive the next generation of personalized education. 
          Every node represents a breakthrough in understanding. Our algorithm adapts to your cognitive velocity.
        </p>
      </div>

      {/* Stats Grid with Glow Effects */}
      <div className="flex flex-wrap gap-4 p-4">
        <Card className="flex-1 min-w-[158px] bg-cyan-900/20 border-cyan-500/30 shadow-[0_0_15px_rgba(6,188,249,0.2)]">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <p className="text-cyan-400/70 text-xs font-bold uppercase tracking-wider">Pattern Recognition</p>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold mb-2">ACTIVE</p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[158px] bg-purple-900/20 border-purple-500/30">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <p className="text-purple-400/70 text-xs font-bold uppercase tracking-wider">Data Density</p>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold mb-2">
              94<span className="text-lg opacity-50">%</span>
            </p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
              <TrendingUp className="w-3 h-3" />
              +3.1%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics List */}
      <div className="px-4 space-y-3">
        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-lg p-4 hover:bg-cyan-900/20 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="font-semibold">Cognitive Load Mapping</span>
            </div>
            <span className="text-xs text-cyan-400">→</span>
          </div>
        </div>

        <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 hover:bg-purple-900/20 transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="font-semibold">Retention Velocity</span>
            </div>
            <span className="text-xs text-purple-400">→</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-4 mt-8">
        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 h-14 text-base shadow-[0_0_20px_rgba(6,188,249,0.3)]">
          <Activity className="w-5 h-5 mr-2" />
          Initiate Deep Dive
        </Button>
        <p className="text-center text-xs text-gray-500 mt-3">
          System Version 4.0.2 / Encrypted_Stream_Active
        </p>
      </div>
    </div>
  );
}