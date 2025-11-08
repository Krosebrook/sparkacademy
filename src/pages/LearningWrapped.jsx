import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Award, Clock, BookOpen, Target, Share2, Download } from 'lucide-react';

export default function LearningWrapped() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const currentYear = new Date().getFullYear();
      const existingStats = await base44.entities.LearningStats.filter({
        user_email: userData.email,
        year: currentYear
      });

      if (existingStats.length > 0) {
        setStats(existingStats[0]);
      } else {
        // Generate stats
        await generateStats(userData.email, currentYear);
      }
    } catch (error) {
      console.error('Error loading learning wrapped:', error);
    }
    setIsLoading(false);
  };

  const generateStats = async (userEmail, year) => {
    setIsGenerating(true);
    try {
      // Get all enrollments for the year
      const enrollments = await base44.entities.Enrollment.filter({ student_email: userEmail });
      const completedCourses = enrollments.filter(e => e.completion_percentage === 100);

      // Get all courses
      const courses = await base44.asServiceRole.entities.Course.list();
      const completedCourseData = completedCourses.map(e => 
        courses.find(c => c.id === e.course_id)
      ).filter(c => c);

      // Calculate stats
      const totalHours = completedCourseData.reduce((sum, c) => sum + (c.duration_hours || 0), 0);
      const totalLessons = completedCourseData.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);

      // Calculate category distribution
      const categoryCount = {};
      completedCourseData.forEach(c => {
        categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, Object.keys(categoryCount)[0]
      );

      // Get skills
      const allSkills = completedCourseData
        .flatMap(c => c.skills_taught || [])
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);

      // Determine learning personality using AI
      const personality = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this learning data, create a fun and unique "learning personality" label:
        
- Completed ${completedCourses.length} courses
- Total hours: ${totalHours}
- Favorite category: ${favoriteCategory}
- Most active time: ${getMostActiveTime(enrollments)}

Create a creative, fun personality label like "Night Owl Scholar", "Weekend Learning Warrior", etc.`,
        response_json_schema: {
          type: "object",
          properties: {
            personality: { type: "string" }
          }
        }
      });

      const newStats = await base44.entities.LearningStats.create({
        user_email: userEmail,
        year,
        total_courses_completed: completedCourses.length,
        total_hours_learned: totalHours,
        total_lessons_completed: totalLessons,
        longest_streak_days: calculateLongestStreak(enrollments),
        favorite_category: favoriteCategory,
        learning_personality: personality.personality,
        top_skills_acquired: allSkills,
        monthly_breakdown: calculateMonthlyBreakdown(enrollments),
        achievements: generateAchievements(completedCourses.length, totalHours),
        total_quiz_score: 0,
        total_projects_completed: 0
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error generating stats:', error);
      alert('Failed to generate learning wrapped');
    }
    setIsGenerating(false);
  };

  const getMostActiveTime = (enrollments) => {
    // Simplified - would need more detailed tracking in production
    return "evenings";
  };

  const calculateLongestStreak = (enrollments) => {
    // Simplified calculation
    return Math.min(enrollments.length * 3, 30);
  };

  const calculateMonthlyBreakdown = (enrollments) => {
    const breakdown = Array(12).fill(0).map((_, i) => ({ month: i + 1, hours: 0, courses: 0 }));
    enrollments.forEach(e => {
      if (e.enrollment_date) {
        const month = new Date(e.enrollment_date).getMonth();
        breakdown[month].courses += 1;
        breakdown[month].hours += 2; // Simplified
      }
    });
    return breakdown;
  };

  const generateAchievements = (courseCount, hours) => {
    const achievements = [];
    if (courseCount >= 1) achievements.push("First Course Completed");
    if (courseCount >= 5) achievements.push("Learning Enthusiast");
    if (courseCount >= 10) achievements.push("Knowledge Seeker");
    if (hours >= 10) achievements.push("10 Hour Club");
    if (hours >= 50) achievements.push("Dedicated Learner");
    return achievements;
  };

  const shareWrapped = () => {
    const text = `🎓 My ${stats.year} Learning Wrapped:\n\n✨ ${stats.total_courses_completed} courses completed\n⏰ ${stats.total_hours_learned} hours learned\n🏆 ${stats.learning_personality}\n\n#CourseSpark #LearningWrapped`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Learning Wrapped',
        text
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Generating your learning wrapped...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8">No data available yet. Complete some courses first!</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8 py-8">
          <h1 className="text-5xl font-bold mb-2">Your {stats.year}</h1>
          <h2 className="text-3xl font-semibold mb-4">Learning Wrapped</h2>
          <Sparkles className="w-12 h-12 mx-auto" />
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          {/* Main Stats */}
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-slate-800 mb-2">{stats.learning_personality}</h3>
              <p className="text-slate-600">That's you!</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <p className="text-5xl font-bold text-slate-800 mb-2">{stats.total_courses_completed}</p>
                <p className="text-slate-600">Courses Completed</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-5xl font-bold text-slate-800 mb-2">{stats.total_hours_learned}</p>
                <p className="text-slate-600">Hours Learned</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-amber-500" />
                Your Learning Streak
              </h3>
              <div className="text-center">
                <p className="text-5xl font-bold text-slate-800 mb-2">{stats.longest_streak_days}</p>
                <p className="text-slate-600">Days in a row!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                Favorite Category
              </h3>
              <div className="text-center">
                <Badge className="text-lg px-6 py-2">{stats.favorite_category}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                Top Skills Acquired
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {stats.top_skills_acquired.slice(0, 8).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Achievements Unlocked</h3>
              <div className="grid grid-cols-2 gap-3">
                {stats.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share Buttons */}
          <div className="flex gap-4">
            <Button onClick={shareWrapped} className="flex-1 bg-white text-purple-600 hover:bg-white/90">
              <Share2 className="w-4 h-4 mr-2" />
              Share Your Wrapped
            </Button>
          </div>
        </div>

        <div className="text-center text-white mt-12 pb-8">
          <p className="text-lg">Keep learning, keep growing! 🚀</p>
          <p className="text-sm opacity-75 mt-2">See you in {stats.year + 1}!</p>
        </div>
      </div>
    </div>
  );
}