import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Users, 
  Calendar, Pin, Plus, Copy, Clock, Zap, Award
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TeamPulseDashboard() {
  const [teamData, setTeamData] = useState({
    momentum: 84,
    momentumChange: 4,
    status: 'HIGH GROWTH',
    weeklyActivity: [
      { day: 'MON', value: 40 },
      { day: 'TUE', value: 65 },
      { day: 'WED', value: 78 },
      { day: 'THU', value: 55 },
      { day: 'FRI', value: 45 },
      { day: 'SAT', value: 30 },
      { day: 'SUN', value: 20 }
    ]
  });

  const [participationData, setParticipationData] = useState([
    { day: 'MON', activity: 45, sentiment: 60 },
    { day: 'TUE', activity: 72, sentiment: 65 },
    { day: 'WED', activity: 85, sentiment: 55 },
    { day: 'THU', activity: 68, sentiment: 75 },
    { day: 'FRI', activity: 50, sentiment: 80 },
    { day: 'SAT', activity: 35, sentiment: 70 },
    { day: 'SUN', activity: 25, sentiment: 65 }
  ]);

  const insights = [
    {
      type: 'WORKING',
      icon: TrendingUp,
      title: 'High engagement on',
      highlight: 'Project X',
      description: 'campaign docs.',
      color: 'emerald'
    },
    {
      type: 'SLIPPING',
      icon: AlertTriangle,
      title: 'Late-night activity spike in',
      highlight: 'Design',
      description: 'sub-group.',
      color: 'amber'
    }
  ];

  const testimonial = {
    text: '"INTInc reduced my 1:1 prep time by 40%. The signals tell me exactly who needs more focus before I even step into the room."',
    author: 'Sarah Chen',
    role: 'ENGINEERING MANAGER',
    avatar: '👤'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Team Pulse</h1>
              <p className="text-xs text-emerald-400 uppercase tracking-wide">Marketing Team (12)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-emerald-300 hover:bg-emerald-800/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-emerald-300 hover:bg-emerald-800/50 relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>

        {/* Momentum Card */}
        <Card className="bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-sm border-emerald-700/50 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Team Momentum</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold">{teamData.momentum}%</span>
                  <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    +{teamData.momentumChange}%
                  </div>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white font-bold px-3 py-1">
                {teamData.status}
              </Badge>
            </div>

            {/* Activity Chart */}
            <div className="relative h-40 mb-2">
              <svg className="w-full h-full" viewBox="0 0 350 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 Q50,40 100,50 T200,30 Q250,45 300,40 L350,35"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                />
                <path
                  d="M0,60 Q50,40 100,50 T200,30 Q250,45 300,40 L350,35 L350,100 L0,100 Z"
                  fill="url(#areaGradient)"
                />
              </svg>
              <div className="absolute top-8 right-20 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                Intervention: All-Hands
              </div>
            </div>

            {/* Days */}
            <div className="flex justify-between text-xs text-emerald-400 uppercase tracking-wider">
              {teamData.weeklyActivity.map(day => (
                <span key={day.day}>{day.day}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Participation Distribution */}
        <Card className="bg-gradient-to-br from-emerald-900/80 to-teal-900/80 backdrop-blur-sm border-emerald-700/50 text-white">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-emerald-400">
              Participation Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-48 mb-4">
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {participationData.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="relative w-8 h-40 flex flex-col justify-end">
                      <div 
                        className="w-full bg-emerald-500/30 rounded-t-lg transition-all"
                        style={{ height: `${day.activity}%` }}
                      >
                        <div 
                          className="w-full bg-emerald-500 rounded-full absolute bottom-0"
                          style={{ 
                            height: `${day.sentiment}%`,
                            transform: `translateY(${100 - day.sentiment}%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-emerald-950/80 px-3 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Privacy Masked</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-emerald-400">
              <span className="uppercase tracking-wider">Activity</span>
              <span className="uppercase tracking-wider">Sentiment</span>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid gap-4">
          {insights.map((insight, idx) => (
            <Card 
              key={idx}
              className={`bg-gradient-to-br border-2 ${
                insight.color === 'emerald' 
                  ? 'from-emerald-900/50 to-emerald-800/50 border-emerald-600/50'
                  : 'from-amber-900/50 to-amber-800/50 border-amber-600/50'
              } backdrop-blur-sm text-white`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    insight.color === 'emerald' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <Badge className={`text-xs font-bold mb-2 ${
                      insight.color === 'emerald'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {insight.type}
                    </Badge>
                    <p className="text-sm leading-relaxed">
                      {insight.title} <span className="font-bold">{insight.highlight}</span> {insight.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Summary */}
        <Card className="bg-gradient-to-br from-teal-900/80 to-emerald-900/80 backdrop-blur-sm border-emerald-700/50 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Weekly Summary Draft
              </h3>
              <Badge className="bg-emerald-500 text-white text-xs font-bold">
                Auto-Generated
              </Badge>
            </div>
            <p className="text-sm italic text-emerald-100 mb-6 leading-relaxed">
              "The team showed strong collaboration on the Q3 launch, though response times on Slack slowed on Friday. Momentum remains high at 84%..."
            </p>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl">
              <Copy className="w-4 h-4 mr-2" />
              COPY TO EMAIL
            </Button>
            <p className="text-xs text-emerald-400 text-center mt-3">
              LAST UPDATED: 2025-10-27 09:42:01 UTC
            </p>
          </CardContent>
        </Card>

        {/* Testimonial */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border-slate-700/50 text-white">
          <CardContent className="p-6">
            <p className="text-sm italic text-gray-300 mb-4 leading-relaxed">
              {testimonial.text}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-lg">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-bold text-sm">{testimonial.author}</p>
                <p className="text-xs text-emerald-400 uppercase tracking-wide">{testimonial.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-emerald-950/95 backdrop-blur-sm border-t border-emerald-800/50 p-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button className="flex flex-col items-center gap-1 text-emerald-400">
              <Users className="w-5 h-5" />
              <span className="text-xs font-semibold">1:1s</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-emerald-400">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-semibold">KUDOS</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-emerald-400">
              <Pin className="w-5 h-5" />
              <span className="text-xs font-semibold">PIN</span>
            </button>
            <button className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white -mt-8 shadow-2xl">
              <Plus className="w-6 h-6" />
            </button>
            <div className="w-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
}