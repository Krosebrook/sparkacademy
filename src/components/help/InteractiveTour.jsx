import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const PAGE_TOURS = {
  Dashboard: [
    {
      title: 'Welcome to Your Dashboard',
      description: 'This is your central hub. Here you can see your course statistics, recent activity, and quick access to important features.',
      target: null,
      position: 'center'
    },
    {
      title: 'Create New Course',
      description: 'Click this button to start creating a new course with AI assistance. You can generate complete courses in minutes!',
      target: '[href*="CourseCreator"]',
      position: 'bottom'
    },
    {
      title: 'Your Stats',
      description: 'Monitor your course performance, total enrollments, and average ratings at a glance.',
      target: 'DashboardStats',
      position: 'bottom'
    },
    {
      title: 'Gamification',
      description: 'Track your points, badges, and achievements. Engage with challenges to earn rewards!',
      target: 'GamificationDashboard',
      position: 'top'
    }
  ],
  CourseCreator: [
    {
      title: 'AI-Powered Course Creation',
      description: 'This page helps you create courses with AI. Just describe what you want to teach!',
      target: null,
      position: 'center'
    },
    {
      title: 'Course Details',
      description: 'Enter your course title, description, and learning objectives here.',
      target: 'input[name="title"]',
      position: 'bottom'
    },
    {
      title: 'Generate with AI',
      description: 'Click this button to let AI generate your complete course structure, lessons, and materials.',
      target: 'button:has-text("Generate")',
      position: 'top'
    }
  ],
  AICreatorStudio: [
    {
      title: 'AI Creator Studio',
      description: 'Your complete toolkit for AI-powered course creation. Access all AI tools in one place.',
      target: null,
      position: 'center'
    },
    {
      title: 'Quick Course Builder',
      description: 'Generate a complete course in seconds by describing your topic.',
      target: '[value="quick"]',
      position: 'bottom'
    },
    {
      title: 'Specialized Tools',
      description: 'Each tab offers specialized AI tools: syllabi, lesson plans, assessments, video scripts, and more!',
      target: 'TabsList',
      position: 'bottom'
    },
    {
      title: 'Generate Content',
      description: 'Fill in the forms and click generate to create professional course materials instantly.',
      target: null,
      position: 'center'
    }
  ],
  MyCourses: [
    {
      title: 'Your Course Library',
      description: 'All your created courses are here. View, edit, and manage your content.',
      target: null,
      position: 'center'
    },
    {
      title: 'Course Actions',
      description: 'Each course has options to edit, view analytics, or manage students.',
      target: '.course-card',
      position: 'right'
    }
  ],
  B2BClientDashboard: [
    {
      title: 'Enterprise Analytics',
      description: 'Track organization-wide learning progress, skill development, and ROI metrics.',
      target: null,
      position: 'center'
    },
    {
      title: 'Organization Selector',
      description: 'Switch between different client organizations to view their analytics.',
      target: 'select',
      position: 'bottom'
    },
    {
      title: 'Key Metrics',
      description: 'Monitor adoption rates, learning hours, AI literacy scores, and skill gaps.',
      target: '.metrics-grid',
      position: 'bottom'
    },
    {
      title: 'Detailed Modules',
      description: 'Use these tabs to access skill mapping, talent pathways, ROI tracking, and more.',
      target: 'TabsList',
      position: 'bottom'
    }
  ],
  GamificationHub: [
    {
      title: 'Achievements & Rewards',
      description: 'Track your learning journey through points, badges, and leaderboards.',
      target: null,
      position: 'center'
    },
    {
      title: 'Your Stats',
      description: 'See your total XP, current level, and earned badges.',
      target: 'GamificationStats',
      position: 'bottom'
    },
    {
      title: 'Leaderboards',
      description: 'Compete with other learners and see where you rank!',
      target: '[value="leaderboard"]',
      position: 'bottom'
    },
    {
      title: 'Badge Collection',
      description: 'View all available badges and track your progress toward earning them.',
      target: '[value="badges"]',
      position: 'bottom'
    }
  ]
};

export default function InteractiveTour({ pageName, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const tour = PAGE_TOURS[pageName] || [];
  const step = tour[currentStep];

  useEffect(() => {
    if (step?.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const pos = calculatePosition(rect, step.position);
        setPosition(pos);
      }
    }
  }, [currentStep, step]);

  const calculatePosition = (rect, position) => {
    const padding = 20;
    switch (position) {
      case 'top':
        return { top: rect.top - 200 - padding, left: rect.left + rect.width / 2 - 200 };
      case 'bottom':
        return { top: rect.bottom + padding, left: rect.left + rect.width / 2 - 200 };
      case 'left':
        return { top: rect.top + rect.height / 2 - 100, left: rect.left - 420 };
      case 'right':
        return { top: rect.top + rect.height / 2 - 100, left: rect.right + padding };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const handleNext = () => {
    if (currentStep < tour.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!tour.length || !step) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      {/* Spotlight on target */}
      {step.target && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {(() => {
            const element = document.querySelector(step.target);
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return (
              <div
                className="absolute border-4 border-purple-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={{
                  top: rect.top - 8,
                  left: rect.left - 8,
                  width: rect.width + 16,
                  height: rect.height + 16
                }}
              />
            );
          })()}
        </div>
      )}
      
      {/* Tour Card */}
      <Card 
        className="fixed w-[400px] z-50 border-purple-500 bg-slate-900 shadow-2xl"
        style={step.position === 'center' ? position : { top: position.top, left: position.left }}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="text-sm text-purple-400 mb-1">
                Step {currentStep + 1} of {tour.length}
              </div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 -mt-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-slate-300 mb-6">{step.description}</p>
          
          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {tour.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentStep ? 'bg-purple-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={handleNext}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {currentStep === tour.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}