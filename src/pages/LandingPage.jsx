
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Wand2, 
  Bot, 
  FileText, 
  Award, 
  Store, 
  BookOpen, 
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  MessageSquare,
  TrendingUp,
  Globe,
  Shield,
  Clock,
  Target,
  Lightbulb,
  GitBranch,
  Trophy,
  Calendar,
  LineChart,
  Palette,
  Video,
  Brain,
  Rocket,
  Heart,
  Star,
  Share2,
  Lock,
  Loader2
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { base44 } from '@/api/base44Client';

export default function LandingPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccessNow = async () => {
    setIsProcessing(true);
    try {
      // Check if user is authenticated
      const isAuthenticated = await base44.auth.isAuthenticated();
      
      if (!isAuthenticated) {
        // Redirect to login with a return URL that will start checkout
        const currentUrl = window.location.origin;
        base44.auth.redirectToLogin(`${currentUrl}/billing`);
        return;
      }

      // User is authenticated, proceed with checkout
      const currentUrl = window.location.origin;
      const response = await base44.functions.invoke('createSubscriptionCheckout', {
        successUrlBase: `${currentUrl}/subscription-success`,
        cancelUrlBase: currentUrl
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <BrandLogo withText size="lg" />
            <Button onClick={handleAccessNow} disabled={isProcessing} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Access Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Powered Learning & Creation Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Your Complete AI-Powered
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Learning Ecosystem</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Create courses, learn from AI tutors, build your portfolio, and grow your career—all powered by cutting-edge AI technology. Everything you need to succeed in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              onClick={handleAccessNow}
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6 px-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Access Now - $9.99/month
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>All Features Included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Instant Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Complete Feature Suite</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Everything you need to create, learn, and grow—all in one powerful platform
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Wand2}
              title="AI Course Creator"
              description="Generate complete courses with lessons, quizzes, and projects in minutes. Just describe your topic and let AI do the heavy lifting."
              gradient="from-purple-500 to-pink-500"
              features={['AI curriculum generation', 'Auto-generated thumbnails', 'Quiz & project creation', 'Unlimited courses']}
            />
            
            <FeatureCard
              icon={Bot}
              title="24/7 AI Learning Assistant"
              description="Your personal AI tutor available anytime. Get instant help, explanations, and guidance on any topic or course material."
              gradient="from-emerald-500 to-teal-500"
              features={['Instant answers', 'Course-specific help', 'Study tips', 'Real-world examples']}
            />
            
            <FeatureCard
              icon={FileText}
              title="AI Notes Generator"
              description="Transform any topic into comprehensive study notes. Perfect for exam prep, quick reviews, and deep learning."
              gradient="from-blue-500 to-cyan-500"
              features={['Topic-based notes', 'Internet research', 'Formatted content', 'Export & share']}
            />
            
            <FeatureCard
              icon={Award}
              title="AI Resume Builder"
              description="Create professional, ATS-optimized resumes with AI assistance. Stand out to employers with perfect formatting."
              gradient="from-orange-500 to-red-500"
              features={['Professional templates', 'AI optimization', 'ATS-friendly', 'Multiple formats']}
            />
            
            <FeatureCard
              icon={Store}
              title="Personal Storefront"
              description="Sell your courses with a beautiful, customizable storefront. No marketplace fees, complete control over pricing."
              gradient="from-indigo-500 to-purple-500"
              features={['Custom branding', 'Flexible pricing', 'Donation links', 'Premium resources']}
            />
            
            <FeatureCard
              icon={BookOpen}
              title="Unlimited Learning"
              description="Access all published courses, enroll unlimited times, track your progress, and earn certificates."
              gradient="from-pink-500 to-rose-500"
              features={['All courses free', 'Progress tracking', 'Certificates', 'Badges & achievements']}
            />
            
            <FeatureCard
              icon={MessageSquare}
              title="Course Discussions"
              description="Engage with instructors and fellow students. Ask questions, share insights, and learn together."
              gradient="from-amber-500 to-orange-500"
              features={['Threaded discussions', 'Instructor responses', 'Like & reply', 'Community support']}
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Perfect For Everyone</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <UseCaseCard
              icon={Lightbulb}
              title="Course Creators"
              description="Create and monetize your expertise with AI-powered tools. Build courses in minutes, not months."
              benefits={[
                'AI course generation',
                'Beautiful storefront',
                'Analytics dashboard',
                'Community building',
                'Multiple revenue streams'
              ]}
            />
            
            <UseCaseCard
              icon={Rocket}
              title="Lifelong Learners"
              description="Access unlimited courses, get AI tutoring, and track your learning journey with powerful tools."
              benefits={[
                'Unlimited course access',
                '24/7 AI tutor',
                'Progress tracking',
                'Certificates & badges',
                'Study resources'
              ]}
            />
            
            <UseCaseCard
              icon={TrendingUp}
              title="Career Advancers"
              description="Build your skills, create professional portfolios, and prepare for your dream job with AI assistance."
              benefits={[
                'Professional resume builder',
                'Skill development',
                'Verifiable certificates',
                'Portfolio showcase',
                'Interview preparation'
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            One Simple Price, Everything Included
          </h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-6xl font-extrabold text-white">$9.99</span>
              <span className="text-2xl text-purple-100">/month</span>
            </div>
            <p className="text-purple-100 text-lg mb-6">
              Cancel anytime • No hidden fees • Instant access
            </p>
            <Button
              size="lg"
              onClick={handleAccessNow}
              disabled={isProcessing}
              className="bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg py-6 px-8 shadow-xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Get Instant Access Now
                </>
              )}
            </Button>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 text-white/90">
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-8 h-8" />
              <span className="text-sm font-semibold">Instant Setup</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8" />
              <span className="text-sm font-semibold">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="w-8 h-8" />
              <span className="text-sm font-semibold">Cancel Anytime</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8" />
              <span className="text-sm font-semibold">All Features</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of creators and learners already using CourseSpark to achieve their goals
          </p>
          <Button
            size="lg"
            onClick={handleAccessNow}
            disabled={isProcessing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg py-6 px-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Access Now - Start Learning Today
                </>
              )}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <BrandLogo withText size="md" textLight />
          <p className="mt-4 text-sm">
            © {new Date().getFullYear()} CourseSpark. Empowering learners with AI.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Secure payments powered by Stripe
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, gradient, features }) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-white h-full">
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-4">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function UseCaseCard({ icon: Icon, title, description, benefits }) {
  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 mb-4">{description}</p>
        <ul className="space-y-2">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
