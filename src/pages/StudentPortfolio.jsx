import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Share2, 
  Edit, 
  MapPin,
  ExternalLink,
  Code,
  FileText,
  TrendingUp,
  Target,
  Award,
  Bell,
  Search,
  MoreHorizontal
} from 'lucide-react';

export default function StudentPortfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio', user?.email],
    queryFn: async () => {
      const portfolios = await base44.entities.StudentPortfolio.filter({ student_email: user.email });
      return portfolios[0];
    },
    enabled: !!user
  });

  const skillMastery = [
    { skill: 'React.js', level: 88, color: 'cyan', proficiency: '74% growth' },
    { skill: 'Python', level: 74, color: 'magenta', proficiency: 'Intermediate' },
    { skill: 'UI/UX', level: 65, color: 'blue', proficiency: 'Growing' }
  ];

  const featuredProjects = [
    {
      title: 'FinTech Dashboard 2.0',
      description: 'Enterprise-grade data visualization platform featuring real-time analytics and predictive AI insights.',
      techs: ['React', 'D3.js', 'Node.js'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      demoUrl: '#',
      caseStudyUrl: '#',
      featured: true
    },
    {
      title: 'EcoShop Mobile Experience',
      description: 'A sustainable shopping app designed to help users track their carbon footprint during checkout.',
      techs: ['React Native', 'Firebase'],
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      demoUrl: '#',
      caseStudyUrl: '#',
      badge: 'WINNER'
    }
  ];

  const aiRecommendation = {
    message: 'Based on your proficiency in React and Python, we recommend specializing in Cloud Infrastructure to increase your job placement eligibility.',
    impact: '16%',
    nextCourse: 'Advanced Prototyping'
  };

  const getSkillColor = (color) => {
    const colors = {
      cyan: { stroke: '#00f2ff', bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30' },
      magenta: { stroke: '#ff00ff', bg: 'from-fuchsia-500/20 to-fuchsia-600/10', border: 'border-fuchsia-500/30' },
      blue: { stroke: '#137fec', bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30' }
    };
    return colors[color] || colors.cyan;
  };

  return (
    <div className="min-h-screen bg-[#0f0618] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f0618]/80 backdrop-blur-md border-b border-purple-500/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-lg font-bold">SparkCourse</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Hero Profile Section */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/10 border-purple-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1">
                <div className="w-full h-full rounded-full bg-[#0f0618] flex items-center justify-center text-4xl font-bold">
                  {user?.full_name?.[0] || 'A'}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-1.5 border-2 border-[#0f0618]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-1">{user?.full_name || 'Alex Rivers'}</h2>
              <p className="text-purple-400 font-medium uppercase text-sm tracking-wider mb-2">
                {portfolio?.portfolio_title || 'Junior Full Stack Developer'}
              </p>
              <div className="flex items-center gap-2 text-gray-400 text-xs justify-center md:justify-start">
                <MapPin className="w-3 h-3" />
                <span>San Francisco, CA • Class of 2024</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <Share2 className="w-4 h-4 mr-2" />
                Share Portfolio
              </Button>
              <Button variant="outline" size="icon" className="border-purple-500/30 hover:bg-purple-500/10">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-purple-900/20 border-purple-500/20 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{portfolio?.courses_completed?.length || 24}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Courses</p>
            </CardContent>
          </Card>
          <Card className="bg-cyan-900/20 border-cyan-500/30 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-cyan-400">92%</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Avg Score</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-900/20 border-blue-500/20 text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{portfolio?.projects?.length || 15}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Mastery */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Skill Mastery</h3>
            <Button variant="link" className="text-purple-400 text-sm">View Analysis</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skillMastery.map((skill, idx) => {
              const colors = getSkillColor(skill.color);
              const circumference = 2 * Math.PI * 34;
              const offset = circumference - (skill.level / 100) * circumference;
              
              return (
                <Card key={idx} className={`bg-gradient-to-br ${colors.bg} ${colors.border} border`}>
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-3">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke={colors.stroke}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{skill.level}%</span>
                      </div>
                    </div>
                    <span className="font-semibold mb-1">{skill.skill}</span>
                    <span className="text-xs text-gray-400">{skill.proficiency}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Featured Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Featured Projects</h3>
            <span className="text-xs text-gray-400">{featuredProjects.length} Total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredProjects.map((project, idx) => (
              <Card key={idx} className="bg-purple-900/20 border-purple-500/20 group hover:bg-purple-900/30 transition-all overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0618] via-[#0f0618]/50 to-transparent" />
                  {project.badge && (
                    <Badge className="absolute top-3 right-3 bg-pink-600 text-white border-0">
                      {project.badge}
                    </Badge>
                  )}
                  {project.featured && (
                    <Badge className="absolute top-3 left-3 bg-yellow-600 text-white border-0">
                      FEATURED
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-5">
                  <h4 className="text-lg font-bold mb-2">{project.title}</h4>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techs.map((tech, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Case Study
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
                    >
                      <Code className="w-3 h-3 mr-1" />
                      Live Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Next Steps */}
        <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  AI Next Steps
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  {aiRecommendation.message}
                </p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Increases employability score by {aiRecommendation.impact}
                  </Badge>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Start Module →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Generated Achievements Summary */}
        <Card className="bg-purple-900/20 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold">AI-Generated Achievement Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/10">
                <p className="text-sm text-gray-300">
                  "You've demonstrated <span className="text-purple-400 font-semibold">exceptional growth</span> in full-stack development, 
                  completing 24 courses with a 92% average. Your FinTech Dashboard project showcases advanced 
                  data visualization skills that align with senior developer roles."
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Generated based on 156 data points across your learning journey</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}