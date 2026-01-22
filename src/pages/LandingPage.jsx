import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  Users,
  Brain,
  Target,
  Zap,
  ArrowRight,
  ChevronDown,
  Building2,
  GraduationCap,
  LineChart } from
'lucide-react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0618] via-[#1a0a2e] to-[#0f0618] text-white overflow-x-hidden">
      {/* Scene 1: Hero Opening */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Mesh Pattern Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        
        {/* Glowing Orbs */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-blue-500/10 blur-[150px] rounded-full" />

        {/* Top Nav */}
        <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400/60">INTInc Presents</p>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 max-w-2xl text-center space-y-6">
          <Badge className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse mr-2" />
            Scene 01: The Catalyst
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
            Is <span className="text-purple-400">AI</span> transforming corporate learning?
          </h1>

          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full" />

          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Join us on a journey through the evolution of enterprise AI training and workforce transformation.
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 flex flex-col items-center gap-3 animate-bounce">
          <p className="text-purple-400/60 text-xs font-bold tracking-[0.3em] uppercase">Scroll to begin</p>
          <ChevronDown className="w-6 h-6 text-purple-400" />
        </div>
      </section>

      {/* Scene 2: Context - The Shift */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/30">
              Archive 2020-2026
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Rapid <span className="text-purple-400">Evolution</span> of AI Training
            </h2>
            <div className="w-16 h-1 bg-purple-500 rounded-full" />
          </div>

          <div className="space-y-12">
            <p className="text-xl text-gray-300 leading-relaxed">
              Over the last years, we've witnessed organizations transition from traditional classroom training to AI-integrated, personalized learning environments that adapt to each employee's role, experience, and goals.
            </p>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">2024 Milestone</span>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Adaptive Learning</h3>
                <p className="text-sm text-gray-400">AI-driven paths replace one-size-fits-all corporate training modules.</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Current</span>
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Personalized Coaching</h3>
                <p className="text-sm text-gray-400">Real-time AI tutors understand employee context and learning pace.</p>
              </div>
            </div>

            {/* Growth Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Enterprise Adoption</p>
                <p className="text-4xl font-bold mb-2">89%</p>
                <p className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +18% YoY
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">ROI Improvement</p>
                <p className="text-4xl font-bold mb-2">3.2x</p>
                <p className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +24%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 3: Personal Impact */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                Personal Impact
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                The Human Touch of AI
              </h2>
              <h3 className="text-2xl font-semibold text-purple-300">Meet Sarah.</h3>
              <div className="space-y-4 text-gray-300">
                <p>
                  As a retail manager looking to pivot into tech leadership, Sarah felt overwhelmed by generic online courses that didn't fit her schedule or background.
                </p>
                <p>
                  INTInc's personalized AI tutor didn't just teach coding concepts—it understood her retail experience, translated complex logic into familiar business scenarios, and adapted to her learning pace.
                </p>
              </div>

              <div className="bg-purple-900/20 border-l-4 border-purple-500 rounded-lg p-6 backdrop-blur-sm">
                <p className="text-purple-100 italic mb-3">
                  "For the first time, I didn't feel like I was fighting the system. The AI made learning feel personal and achievable."
                </p>
                <p className="text-purple-400 text-sm font-bold">— SARAH R., TECH TEAM LEAD</p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-32 h-32 text-purple-400/40" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm font-bold">Career Progression</p>
                    <p className="text-xs text-gray-400">6 months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 4: Systems */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/30">
            Scene 4: The Architecture
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            INTInc AI Engine
          </h2>

          {/* System Diagram */}
          <div className="relative w-full aspect-square max-w-md mx-auto mb-16">
            {/* Central Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-32 h-32 rounded-full bg-purple-600/30 border-2 border-purple-500 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                <Brain className="w-16 h-16 text-purple-300" />
              </div>
            </div>

            {/* Orbiting Nodes */}
            <div className="absolute top-[15%] left-[15%]">
              <div className="bg-purple-800/40 backdrop-blur-md border border-purple-500/40 rounded-xl p-4 text-center">
                <LineChart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-purple-300">Employee Data</p>
              </div>
            </div>
            <div className="absolute top-[15%] right-[15%]">
              <div className="bg-blue-800/40 backdrop-blur-md border border-blue-500/40 rounded-xl p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-blue-300">Market Trends</p>
              </div>
            </div>
            <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2">
              <div className="bg-purple-800/40 backdrop-blur-md border border-purple-500/40 rounded-xl p-4 text-center">
                <GraduationCap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-purple-300">Training Content</p>
              </div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
            { label: 'Status', value: 'Active', color: 'emerald' },
            { label: 'Precision', value: '99.7%', color: 'purple' },
            { label: 'Latency', value: '8ms', color: 'blue' }].
            map((stat) =>
            <div key={stat.label} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-xl p-4`}>
                <p className={`text-${stat.color}-400 text-xs font-bold uppercase tracking-wider mb-1`}>{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scene 5: The Future */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/30">
              Scene 5: Tomorrow
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Power of Personalization
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Traditional training creates completion metrics. AI-driven learning creates mastery.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Employee Agency</h3>
              <p className="text-gray-400 text-sm mb-4">
                Learners define their pace and focus areas based on role requirements and career goals.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[92%]" />
                </div>
                <span className="text-sm font-bold text-purple-400">92%</span>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Skill Mastery</h3>
              <p className="text-gray-400 text-sm mb-4">
                Long-term retention through adaptive repetition and real-world application scenarios.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[86%]" />
                </div>
                <span className="text-sm font-bold text-blue-400">86%</span>
              </div>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Business Impact</h3>
              <p className="text-gray-400 text-sm mb-4">
                Measurable ROI through faster onboarding, reduced turnover, and improved performance.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                </div>
                <span className="text-sm font-bold text-emerald-400">3.2x</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            The future of corporate learning is personal. <span className="text-purple-400">Start your transformation today.</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Billing')}>
              <Button className="btn-primary text-lg h-14 px-8 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)]">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" className="bg-background text-slate-50 px-8 py-2 text-lg font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-14 border-purple-500/30 hover:bg-purple-500/10">
                View Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Proven ROI</span>
            </div>
          </div>
        </div>

        {/* Floating decoration */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-1 bg-purple-500/20 rounded-full" />
      </section>
    </div>);

}